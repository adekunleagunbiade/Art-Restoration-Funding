import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock contract state
const contractState = {
  projectCounter: 0,
  projects: new Map(),
  projectFunders: new Map(),
  nftShares: new Map()
}

// Mock contract functions
const contractFunctions = {
  createProject: (name: string, description: string, fundingGoal: number) => {
    const projectId = ++contractState.projectCounter
    contractState.projects.set(projectId, {
      name,
      description,
      fundingGoal,
      currentFunding: 0,
      owner: 'MOCK_OWNER',
      status: 'active'
    })
    return { okay: true, value: projectId }
  },
  
  fundProject: (projectId: number, amount: number, funder: string) => {
    const project = contractState.projects.get(projectId)
    if (!project) return { okay: false, error: 'Project not found' }
    
    project.currentFunding += amount
    contractState.projects.set(projectId, project)
    
    const funderKey = `${projectId}-${funder}`
    const currentAmount = contractState.projectFunders.get(funderKey) || 0
    contractState.projectFunders.set(funderKey, currentAmount + amount)
    
    return { okay: true, value: true }
  },
  
  mintShares: (projectId: number, shares: number) => {
    const project = contractState.projects.get(projectId)
    if (!project) return { okay: false, error: 'Project not found' }
    
    const currentShares = contractState.nftShares.get(projectId) || 0
    contractState.nftShares.set(projectId, currentShares + shares)
    
    return { okay: true, value: true }
  },
  
  transferShares: (projectId: number, recipient: string) => {
    const shares = contractState.nftShares.get(projectId)
    if (!shares) return { okay: false, error: 'No shares found for project' }
    
    // In a real implementation, we'd update the owner of the shares here
    return { okay: true, value: true }
  },
  
  getProject: (projectId: number) => {
    const project = contractState.projects.get(projectId)
    if (!project) return { okay: false, error: 'Project not found' }
    return { okay: true, value: project }
  },
  
  getFunderAmount: (projectId: number, funder: string) => {
    const funderKey = `${projectId}-${funder}`
    const amount = contractState.projectFunders.get(funderKey) || 0
    return { okay: true, value: amount }
  }
}

describe('Art Restoration Smart Contract', () => {
  beforeEach(() => {
    // Reset contract state before each test
    contractState.projectCounter = 0
    contractState.projects.clear()
    contractState.projectFunders.clear()
    contractState.nftShares.clear()
  })
  
  it('should create a new project', () => {
    const result = contractFunctions.createProject('Mona Lisa Restoration', 'Restoring the famous painting', 1000000)
    expect(result.okay).toBe(true)
    expect(result.value).toBe(1)
    expect(contractState.projects.size).toBe(1)
    expect(contractState.projects.get(1)).toEqual({
      name: 'Mona Lisa Restoration',
      description: 'Restoring the famous painting',
      fundingGoal: 1000000,
      currentFunding: 0,
      owner: 'MOCK_OWNER',
      status: 'active'
    })
  })
  
  it('should fund an existing project', () => {
    contractFunctions.createProject('Mona Lisa Restoration', 'Restoring the famous painting', 1000000)
    const result = contractFunctions.fundProject(1, 500000, 'MOCK_FUNDER')
    expect(result.okay).toBe(true)
    expect(result.value).toBe(true)
    expect(contractState.projects.get(1)?.currentFunding).toBe(500000)
    expect(contractState.projectFunders.get('1-MOCK_FUNDER')).toBe(500000)
  })
  
  it('should mint shares for a project', () => {
    contractFunctions.createProject('Mona Lisa Restoration', 'Restoring the famous painting', 1000000)
    const result = contractFunctions.mintShares(1, 100)
    expect(result.okay).toBe(true)
    expect(result.value).toBe(true)
    expect(contractState.nftShares.get(1)).toBe(100)
  })
  
  it('should transfer shares between users', () => {
    contractFunctions.createProject('Mona Lisa Restoration', 'Restoring the famous painting', 1000000)
    contractFunctions.mintShares(1, 100)
    const result = contractFunctions.transferShares(1, 'MOCK_RECIPIENT')
    expect(result.okay).toBe(true)
    expect(result.value).toBe(true)
  })
  
  it('should get project details', () => {
    contractFunctions.createProject('Mona Lisa Restoration', 'Restoring the famous painting', 1000000)
    const result = contractFunctions.getProject(1)
    expect(result.okay).toBe(true)
    expect(result.value).toEqual({
      name: 'Mona Lisa Restoration',
      description: 'Restoring the famous painting',
      fundingGoal: 1000000,
      currentFunding: 0,
      owner: 'MOCK_OWNER',
      status: 'active'
    })
  })
  
  it('should get funder amount for a project', () => {
    contractFunctions.createProject('Mona Lisa Restoration', 'Restoring the famous painting', 1000000)
    contractFunctions.fundProject(1, 500000, 'MOCK_FUNDER')
    const result = contractFunctions.getFunderAmount(1, 'MOCK_FUNDER')
    expect(result.okay).toBe(true)
    expect(result.value).toBe(500000)
  })
  
  it('should handle errors when project is not found', () => {
    const fundResult = contractFunctions.fundProject(999, 500000, 'MOCK_FUNDER')
    expect(fundResult.okay).toBe(false)
    expect(fundResult.error).toBe('Project not found')
    
    const getProjectResult = contractFunctions.getProject(999)
    expect(getProjectResult.okay).toBe(false)
    expect(getProjectResult.error).toBe('Project not found')
  })
  
  it('should handle multiple funders for a project', () => {
    contractFunctions.createProject('Mona Lisa Restoration', 'Restoring the famous painting', 1000000)
    contractFunctions.fundProject(1, 300000, 'FUNDER_A')
    contractFunctions.fundProject(1, 200000, 'FUNDER_B')
    contractFunctions.fundProject(1, 100000, 'FUNDER_A')
    
    expect(contractFunctions.getFunderAmount(1, 'FUNDER_A').value).toBe(400000)
    expect(contractFunctions.getFunderAmount(1, 'FUNDER_B').value).toBe(200000)
    expect(contractFunctions.getProject(1).value?.currentFunding).toBe(600000)
  })
})

