;; title: SkillMint - Skill-Based Micro-Learning Marketplace
;; version: 1.0.0
;; summary: A decentralized platform for micro-learning with NFT skill verification
;; description: Enables creation of micro-learning modules, peer verification of skills,
;;              and minting of composite skill NFTs with decay mechanics

;; traits
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; token definitions
(define-non-fungible-token skill-certificate uint)
(define-non-fungible-token lesson-plan uint)
(define-fungible-token skill-token)

;; constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_ALREADY_EXISTS (err u101))
(define-constant ERR_NOT_FOUND (err u102))
(define-constant ERR_INVALID_SKILL_LEVEL (err u103))
(define-constant ERR_INSUFFICIENT_REVIEWS (err u104))
(define-constant ERR_SKILL_EXPIRED (err u105))
(define-constant ERR_INVALID_BOUNTY (err u106))
(define-constant ERR_ALREADY_REVIEWED (err u107))
(define-constant ERR_SELF_REVIEW (err u108))

(define-constant SKILL_DECAY_BLOCKS u144000) ;; ~100 days assuming 1 block per minute
(define-constant MIN_REVIEWS_REQUIRED u3)
(define-constant PASSING_SCORE u70)

;; data vars
(define-data-var next-lesson-id uint u1)
(define-data-var next-certificate-id uint u1)
(define-data-var next-bounty-id uint u1)
(define-data-var platform-fee uint u5) ;; 5% platform fee

;; data maps
(define-map lesson-plans uint {
    creator: principal,
    title: (string-ascii 128),
    description: (string-ascii 512),
    skill-category: (string-ascii 64),
    difficulty: uint, ;; 1-5 scale
    price: uint,
    completion-count: uint,
    created-at: uint
})

(define-map skill-certificates uint {
    owner: principal,
    skill-category: (string-ascii 64),
    skill-level: uint, ;; 1-100 scale
    lessons-completed: (list 50 uint),
    peer-reviews: (list 10 uint),
    average-score: uint,
    certified-at: uint,
    expires-at: uint,
    is-composite: bool
})

(define-map user-progress {user: principal, lesson-id: uint} {
    completed: bool,
    score: uint,
    completed-at: uint
})

(define-map peer-reviews uint {
    reviewer: principal,
    certificate-id: uint,
    score: uint, ;; 1-100 scale
    feedback: (string-ascii 256),
    reviewed-at: uint
})

(define-map skill-bounties uint {
    employer: principal,
    title: (string-ascii 128),
    description: (string-ascii 512),
    required-skills: (list 10 (string-ascii 64)),
    reward-amount: uint,
    is-active: bool,
    winner: (optional principal),
    created-at: uint
})

(define-map user-reviews {reviewer: principal, certificate-id: uint} bool)

(define-map composite-skills {skill1: (string-ascii 64), skill2: (string-ascii 64)} (string-ascii 64))


;; public functions

;; Create a new micro-learning lesson plan
(define-public (create-lesson-plan (title (string-ascii 128)) 
                                  (description (string-ascii 512))
                                  (skill-category (string-ascii 64))
                                  (difficulty uint)
                                  (price uint))
    (let ((lesson-id (var-get next-lesson-id)))
        (asserts! (and (>= difficulty u1) (<= difficulty u5)) ERR_INVALID_SKILL_LEVEL)
        (map-set lesson-plans lesson-id {
            creator: tx-sender,
            title: title,
            description: description,
            skill-category: skill-category,
            difficulty: difficulty,
            price: price,
            completion-count: u0,
            created-at: stacks-block-height
        })
        (var-set next-lesson-id (+ lesson-id u1))
        (try! (nft-mint? lesson-plan lesson-id tx-sender))
        (ok lesson-id)))

;; Complete a lesson and record progress
(define-public (complete-lesson (lesson-id uint) (score uint))
    (let ((lesson (unwrap! (map-get? lesson-plans lesson-id) ERR_NOT_FOUND)))
        (asserts! (and (>= score u1) (<= score u100)) ERR_INVALID_SKILL_LEVEL)
        (map-set user-progress {user: tx-sender, lesson-id: lesson-id} {
            completed: true,
            score: score,
            completed-at: stacks-block-height
        })
        (map-set lesson-plans lesson-id (merge lesson {
            completion-count: (+ (get completion-count lesson) u1)
        }))
        (ok true)))

;; Submit skill demonstration for peer review
(define-public (submit-skill-certification (skill-category (string-ascii 64))
                                          (lessons-completed (list 50 uint)))
    (let ((certificate-id (var-get next-certificate-id)))
        (asserts! (> (len lessons-completed) u0) ERR_NOT_FOUND)
        (map-set skill-certificates certificate-id {
            owner: tx-sender,
            skill-category: skill-category,
            skill-level: u0, ;; Will be updated after peer reviews
            lessons-completed: lessons-completed,
            peer-reviews: (list),
            average-score: u0,
            certified-at: stacks-block-height,
            expires-at: (+ stacks-block-height SKILL_DECAY_BLOCKS),
            is-composite: false
        })
        (var-set next-certificate-id (+ certificate-id u1))
        (ok certificate-id)))

;; Peer review a skill demonstration
(define-public (submit-peer-review (certificate-id uint) 
                                  (score uint) 
                                  (feedback (string-ascii 256)))
    (let ((certificate (unwrap! (map-get? skill-certificates certificate-id) ERR_NOT_FOUND))
          (review-id (+ certificate-id (* u1000000 (len (get peer-reviews certificate))))))
        (asserts! (not (is-eq tx-sender (get owner certificate))) ERR_SELF_REVIEW)
        (asserts! (is-none (map-get? user-reviews {reviewer: tx-sender, certificate-id: certificate-id})) ERR_ALREADY_REVIEWED)
        (asserts! (and (>= score u1) (<= score u100)) ERR_INVALID_SKILL_LEVEL)
        
        ;; Record the review
        (map-set peer-reviews review-id {
            reviewer: tx-sender,
            certificate-id: certificate-id,
            score: score,
            feedback: feedback,
            reviewed-at: stacks-block-height
        })
        
        ;; Mark reviewer as having reviewed this certificate
        (map-set user-reviews {reviewer: tx-sender, certificate-id: certificate-id} true)
        
        ;; Update certificate with new review
        (let ((current-reviews (get peer-reviews certificate))
              (updated-reviews (unwrap! (as-max-len? (append current-reviews review-id) u10) ERR_NOT_AUTHORIZED)))
            (map-set skill-certificates certificate-id 
                (merge certificate {peer-reviews: updated-reviews}))
            
            ;; If we have enough reviews, calculate final score and mint NFT
            (if (>= (len updated-reviews) MIN_REVIEWS_REQUIRED)
                (try! (finalize-certification certificate-id))
                (ok true))
            
            (ok review-id))))

;; Create composite skill NFT from multiple certifications
(define-public (create-composite-skill (skill1 (string-ascii 64)) 
                                      (skill2 (string-ascii 64))
                                      (composite-name (string-ascii 64)))
    (let ((certificate-id (var-get next-certificate-id)))
        ;; Verify user has both skills and they're not expired
        (asserts! (has-valid-skill skill1 tx-sender) ERR_NOT_FOUND)
        (asserts! (has-valid-skill skill2 tx-sender) ERR_NOT_FOUND)
        
        ;; Create composite skill certificate
        (map-set skill-certificates certificate-id {
            owner: tx-sender,
            skill-category: composite-name,
            skill-level: u100, ;; Composite skills are considered expert level
            lessons-completed: (list),
            peer-reviews: (list),
            average-score: u100,
            certified-at: stacks-block-height,
            expires-at: (+ stacks-block-height SKILL_DECAY_BLOCKS),
            is-composite: true
        })
        
        ;; Record the composite skill mapping
        (map-set composite-skills {skill1: skill1, skill2: skill2} composite-name)
        
        (var-set next-certificate-id (+ certificate-id u1))
        (try! (nft-mint? skill-certificate certificate-id tx-sender))
        (ok certificate-id)))

;; Create employer bounty for specific skills
(define-public (create-skill-bounty (title (string-ascii 128))
                                   (description (string-ascii 512))
                                   (required-skills (list 10 (string-ascii 64)))
                                   (reward-amount uint))
    (let ((bounty-id (var-get next-bounty-id)))
        (asserts! (> reward-amount u0) ERR_INVALID_BOUNTY)
        (asserts! (> (len required-skills) u0) ERR_INVALID_BOUNTY)
        
        ;; Transfer reward to contract (simplified - in real implementation would use escrow)
        (try! (stx-transfer? reward-amount tx-sender (as-contract tx-sender)))
        
        (map-set skill-bounties bounty-id {
            employer: tx-sender,
            title: title,
            description: description,
            required-skills: required-skills,
            reward-amount: reward-amount,
            is-active: true,
            winner: none,
            created-at: stacks-block-height
        })
        
        (var-set next-bounty-id (+ bounty-id u1))
        (ok bounty-id)))

;; Claim bounty if user has required skills
(define-public (claim-bounty (bounty-id uint))
    (let ((bounty (unwrap! (map-get? skill-bounties bounty-id) ERR_NOT_FOUND)))
        (asserts! (get is-active bounty) ERR_NOT_FOUND)
        (asserts! (has-all-skills (get required-skills bounty) tx-sender) ERR_NOT_AUTHORIZED)
        
        ;; Update bounty status
        (map-set skill-bounties bounty-id (merge bounty {
            is-active: false,
            winner: (some tx-sender)
        }))
        
        ;; Transfer reward to winner
        (try! (as-contract (stx-transfer? (get reward-amount bounty) tx-sender tx-sender)))
        (ok true)))

;; Refresh expired skill certification
(define-public (refresh-certification (certificate-id uint))
    (let ((certificate (unwrap! (map-get? skill-certificates certificate-id) ERR_NOT_FOUND)))
        (asserts! (is-eq tx-sender (get owner certificate)) ERR_NOT_AUTHORIZED)
        (asserts! (<= (get expires-at certificate) stacks-block-height) ERR_NOT_AUTHORIZED)
        
        ;; Reset expiration date
        (map-set skill-certificates certificate-id (merge certificate {
            expires-at: (+ stacks-block-height SKILL_DECAY_BLOCKS)
        }))
        (ok true)))