const getUniqueId = () => { return Cypress._.uniqueId(Date.now().toString()); };
const email = `${getUniqueId()}@test.com`;
let token = '';

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
      url: 'http://localhost:3000/api/user/affinity',
      headers: {
        'Authorization': token
      },
      body: {
        topic: "Technology",
        subtopic: "Artificial Intelligence",
        affinityValue: 0.1,
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('topic')
      expect(response.body).to.have.property('subtopic')
      expect(response.body).to.have.property('affinityValue')
    })
  });
});