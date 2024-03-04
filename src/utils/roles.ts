export const roles = ['Frontend', 'Backend', 'ML', 'AI/Data', 'DevOps', 'QA']
export const roleAffinities = {
  Frontend: {
    '1': 0.3,
    '7': 0.1,
    '13': 0.2,
    '19': 0.1,
    '25': 0.5,
    '31': 0.7,
    '37': 0.8,
    '43': 0.6,
    '49': 0.9,
    '55': 0.4,
    '61': 0.1,
    '67': 0.0
  },
  Backend: {
    '1': 0.6,
    '7': 0.2,
    '13': 0.4,
    '19': 0.3,
    '25': 0.8,
    '31': 0.3,
    '37': 0.9,
    '43': 0.8,
    '49': 0.7,
    '55': 0.2,
    '61': 0.4,
    '67': 0.1
  },
  ML: {
    '1': 0.5,
    '7': 0.9,
    '13': 0.2,
    '19': 0.8,
    '25': 0.3,
    '31': 0.2,
    '37': 0.6,
    '43': 0.5,
    '49': 0.1,
    '55': 0.4,
    '61': 0.7,
    '67': 0.2
  },
  'AI/Data': {
    '1': 0.4,
    '7': 0.9,
    '13': 0.1,
    '19': 0.9,
    '25': 0.4,
    '31': 0.2,
    '37': 0.5,
    '43': 0.4,
    '49': 0.1,
    '55': 0.3,
    '61': 0.8,
    '67': 0.2
  },
  DevOps: {
    '1': 0.4,
    '7': 0.1,
    '13': 0.6,
    '19': 0.2,
    '25': 0.7,
    '31': 0.3,
    '37': 0.8,
    '43': 0.9,
    '49': 0.5,
    '55': 0.2,
    '61': 0.3,
    '67': 0.1
  },
  QA: {
    '1': 0.7,
    '7': 0.2,
    '13': 0.3,
    '19': 0.4,
    '25': 0.5,
    '31': 0.6,
    '37': 0.9,
    '43': 0.8,
    '49': 0.6,
    '55': 0.4,
    '61': 0.5,
    '67': 0.1
  }
}

export const roleTopics = {
  Frontend: [
    '49', // Web Development and Internet Technologies
    '50', // HTML/CSS
    '51', // JavaScript
    '52', // Web application frameworks
    '53', // RESTful services
    '54' // Web security
  ],
  Backend: [
    '25', // Database Systems and Management
    '26', // Relational databases
    '27', // NoSQL databases
    '28', // SQL programming
    '29', // Database design
    '30' // Transaction management
  ],
  ML: [
    '7', // Artificial Intelligence (AI) and Machine Learning
    '8', // Neural networks
    '9', // Reinforcement learning
    '10', // Natural language processing
    '11', // Computer vision
    '12' // Deep learning
  ],
  'AI/Data': [
    '19', // Data Science and Analytics
    '20', // Statistical methods
    '21', // Machine learning in analytics
    '22', // Data visualization
    '23', // Big data processing
    '24' // Predictive modeling
  ],
  DevOps: [
    '37', // Programming Languages and Software Development
    '38', // Object-oriented programming
    '39', // Functional programming
    '40', // Software testing
    '41', // Web development frameworks
    '42' // Version control systems
  ],
  QA: [
    '1', // Algorithms and Data Structures
    '2', // Sorting algorithms
    '3', // Graph theory
    '4', // Data structures
    '5', // Dynamic programming
    '6' // Complexity analysis
  ]
}
