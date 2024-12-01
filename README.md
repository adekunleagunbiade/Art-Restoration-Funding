# Art Restoration Project Smart Contract

## Overview

This Clarity smart contract enables decentralized crowdfunding and fractional ownership for art restoration projects on the Stacks blockchain. It allows project creators to propose art restoration initiatives, secure funding, and offer fractional ownership through NFT shares.

## Features

- Create art restoration project proposals
- Crowdfund restoration projects
- Mint and transfer fractional ownership NFT shares
- Track project funding and status

## Contract Components

### Data Variables
- `project-counter`: Tracks the total number of created projects

### Data Maps
- `projects`: Stores detailed information about each restoration project
    - Project ID
    - Project name
    - Description
    - Funding goal
    - Current funding
    - Project owner
    - Project status

- `project-funders`: Tracks funding contributions by individual funders

### Non-Fungible Token
- `art-share`: Represents fractional ownership in a restoration project

## Functions

### Project Creation
`create-project(name, description, funding-goal)`
- Creates a new art restoration project
- Sets initial project status to "active"
- Returns unique project ID

### Funding
`fund-project(project-id, amount)`
- Allows users to contribute funds to a specific project
- Transfers STX tokens to the contract
- Updates project's current funding
- Tracks individual funder contributions

### NFT Share Management
`mint-shares(project-id, shares)`
- Project owner can mint fractional ownership NFT shares
- Requires project ownership verification

`transfer-shares(project-id, recipient)`
- Enables transfer of NFT shares between principals

### Project Management
`update-project-status(project-id, new-status)`
- Project owner can update project status
- Restricted to project owner

## Read-Only Functions

`get-project(project-id)`
- Retrieve complete project details

`get-funder-amount(project-id, funder)`
- Check funding amount for a specific funder

## Usage Example

```clarity
;; Create a restoration project
(create-project 
  "Restore Renaissance Painting" 
  u"Detailed restoration of a 15th-century masterpiece" 
  u10000
)

;; Fund the project
(fund-project u1 u500)

;; Mint ownership shares
(mint-shares u1 u10)
```

## Security Considerations
- Project creation and status updates are restricted to project owners
- Funding transfers are managed through the contract
- Individual funder contributions are tracked

## Dependencies
- Stacks blockchain
- Clarity smart contract language

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
[Insert appropriate license]

## Contact
[Project maintainer contact information]
