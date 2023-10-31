const getUniqueId = () => { return Cypress._.uniqueId(Date.now().toString()); };
const email = `${getUniqueId()}@test.com`;
let token = '';
let affinityId = '';

describe('User Affinity Test', () => {
  it('Signing Up New User to Test Affinity', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/signup',
      body: {
        firstName: "Test",
        lastName: "User",
        email,
        username: `${getUniqueId()}`, 
        password: "123!!!", 
        birthDate: "2000-10-10"
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('token')
      token = response.body.token
    })
  })

  it('Creating a new affinity for user', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/user/affinities',
      headers: {
        'Authorization': token
      },
      body: {
        topic: "Technology",
        subTopic: "Artificial Intelligence",
        affinityValue: 0.1,
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('topic')
      expect(response.body).to.have.property('subTopic')
      expect(response.body).to.have.property('affinityValue')
      affinityId = response.body._id
    })
  });

  it('Posting bad affinity for user without topic, expected to fail', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: 'http://localhost:3000/api/user/affinities',
      headers: {
        'Authorization': token
      },
      body: {
        subTopic: "Artificial Intelligence",
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  });

  it('Gets all affinities for user', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000/api/user/affinities',
      headers: {
        'Authorization': token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.length).to.be.greaterThan(0)
    })
  });

  it('Gets a specific affinity for user', () => {
    cy.request({
      method: 'GET',
      url: `http://localhost:3000/api/user/affinities/${affinityId}`,
      headers: {
        'Authorization': token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('topic')
      expect(response.body).to.have.property('subTopic')
      expect(response.body).to.have.property('affinityValue')
    })
  });

  it('Gets a specific affinity for user, expected to fail because affinity does not exist', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      url: `http://localhost:3000/api/user/affinities/123456789`,
      headers: {
        'Authorization': token
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  });

  it('Updating an affinity for user', () => {
    cy.request({
      method: 'PUT',
      url: `http://localhost:3000/api/user/affinities/${affinityId}`,
      headers: {
        'Authorization': token
      },
      body: {
        affinityValue: 0.2,
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('affinityValue')
      expect(response.body.affinityValue).to.eq(0.2)
    })
  });

  it('Updating an affinity for user, expected to fail because affinity does not exist', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      url: `http://localhost:3000/api/user/affinities/123456789`,
      headers: {
        'Authorization': token
      },
      body: {
        affinityValue: 0.2,
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  });

  it('Deleting an affinity for user', () => {
    cy.request({
      method: 'DELETE',
      url: `http://localhost:3000/api/user/affinities/${affinityId}`,
      headers: {
        'Authorization': token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });

  it('Deleting an affinity for user, expected to fail because affinity does not exist', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      url: `http://localhost:3000/api/user/affinities/123456789`,
      headers: {
        'Authorization': token
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  });
});