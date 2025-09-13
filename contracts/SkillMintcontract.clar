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
