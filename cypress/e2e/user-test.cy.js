const getUniqueId = () => { return Cypress._.uniqueId(Date.now().toString()); };
const email = `${getUniqueId()}@test.com`;
let token = '';

describe('Authentication', () => {
  it('Signing Up New User', () => {
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

  it('Logging in User', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/signin',
      body: {
        email,
        password: "123!!!"
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('token')
      token = response.body.token
    }
    )
  })

  it('Getting user info', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000/api/user',
      headers: {
        'Authorization': token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('email')
      expect(response.body).to.have.property('username')
      expect(response.body).to.have.property('firstName')
      expect(response.body).to.have.property('lastName')
      expect(response.body).to.have.property('birthDate')
    })
  })

  it('Updating user info', () => {
    cy.request({
      method: 'PUT',
      url: 'http://localhost:3000/api/user',
      headers: {
        'Authorization': token
      },
      body: {
        firstName: "Test",
        lastName: "User",
        email,
        username: `${getUniqueId()}`, 
        birthDate: "2000-10-10",
        profilePicture: "test.png"
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('email')
      expect(response.body).to.have.property('username')
      expect(response.body).to.have.property('firstName')
      expect(response.body).to.have.property('lastName')
      expect(response.body).to.have.property('birthDate')
    })
  });

  it('Changing papssword', () => {
    cy.request({
      method: 'PUT',
      url: 'http://localhost:3000/api/user',
      headers: {
        'Authorization': token
      },
      body: {
        email,
        password: "123!!!",
        newPassword: "1234!!!"
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });

  it('Failed to change new password because it is same as old, expect error', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      url: 'http://localhost:3000/api/user',
      headers: {
        'Authorization': token
      },
      body: {
        email,
        password: "1234!!!",
        newPassword: "1234!!!"
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  });

  it('Delete User, expected to fail because it requires email and password to delete', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      url: 'http://localhost:3000/api/user',
      headers: {
        'Authorization': token
      }
    }).then((response) => {
      expect(response.status).to.eq(400)
    })
  });

  it('Delete User', () => {
    cy.request({
      method: 'DELETE',
      url: 'http://localhost:3000/api/user',
      headers: {
        'Authorization': token
      },
      body: {
        email,
        password: "1234!!!"
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });

  it('Logging in as deleted User, expected to fail', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: 'http://localhost:3000/api/auth/signin',
      body: {
        email,
        password: "1234!!!"
      }
    }).then((response) => {
      expect(response.status).to.eq(401)
    }
    )
  });
})

