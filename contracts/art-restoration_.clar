;; Art Restoration Project Contract

;; Define data vars
(define-data-var project-counter uint u0)

;; Define data maps
(define-map projects
  { project-id: uint }
  {
    name: (string-ascii 100),
    description: (string-utf8 1000),
    funding-goal: uint,
    current-funding: uint,
    owner: principal,
    status: (string-ascii 20)
  }
)

(define-map project-funders
  { project-id: uint, funder: principal }
  { amount: uint }
)

;; Define NFT for fractional ownership
(define-non-fungible-token art-share uint)

;; Functions

;; Create a new restoration project
(define-public (create-project (name (string-ascii 100)) (description (string-utf8 1000)) (funding-goal uint))
  (let
    (
      (project-id (+ (var-get project-counter) u1))
    )
    (map-set projects
      { project-id: project-id }
      {
        name: name,
        description: description,
        funding-goal: funding-goal,
        current-funding: u0,
        owner: tx-sender,
        status: "active"
      }
    )
    (var-set project-counter project-id)
    (ok project-id)
  )
)

;; Fund a project
(define-public (fund-project (project-id uint) (amount uint))
  (let
    (
      (project (unwrap! (map-get? projects { project-id: project-id }) (err u404)))
      (new-funding (+ (get current-funding project) amount))
    )
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set projects
      { project-id: project-id }
      (merge project { current-funding: new-funding })
    )
    (map-set project-funders
      { project-id: project-id, funder: tx-sender }
      { amount: (default-to u0 (get amount (map-get? project-funders { project-id: project-id, funder: tx-sender }))) }
    )
    (ok true)
  )
)

;; Mint NFT shares for a project
(define-public (mint-shares (project-id uint) (shares uint))
  (let
    (
      (project (unwrap! (map-get? projects { project-id: project-id }) (err u404)))
    )
    (asserts! (is-eq (get owner project) tx-sender) (err u403))
    (nft-mint? art-share project-id tx-sender)
  )
)

;; Transfer NFT shares
(define-public (transfer-shares (project-id uint) (recipient principal))
  (nft-transfer? art-share project-id tx-sender recipient)
)

;; Update project status
(define-public (update-project-status (project-id uint) (new-status (string-ascii 20)))
  (let
    (
      (project (unwrap! (map-get? projects { project-id: project-id }) (err u404)))
    )
    (asserts! (is-eq (get owner project) tx-sender) (err u403))
    (map-set projects
      { project-id: project-id }
      (merge project { status: new-status })
    )
    (ok true)
  )
)

;; Read-only functions

;; Get project details
(define-read-only (get-project (project-id uint))
  (map-get? projects { project-id: project-id })
)

;; Get project funding amount for a specific funder
(define-read-only (get-funder-amount (project-id uint) (funder principal))
  (get amount (map-get? project-funders { project-id: project-id, funder: funder }))
)

