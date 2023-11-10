const getUniqueId = () => {
  return Cypress._.uniqueId(Date.now().toString())
}
const email = `${getUniqueId()}@test.com`
let token = ''
const URL = 'localhost:3000/api'

describe('Authentication', () => {
  it('Signing Up New User', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/signup',
      body: {
        firstName: 'Test',
        lastName: 'User',
        email,
        username: `${getUniqueId()}`,
        password: '123!!!',
        birthDate: '2000-10-10'
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
        password: '123!!!'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('token')
      token = response.body.token
    })
  })

  it('Getting user info', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000/api/user',
      headers: {
        Authorization: token
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
        Authorization: token
      },
      body: {
        firstName: 'Test',
        lastName: 'User',
        email,
        username: `${getUniqueId()}`,
        birthDate: '2000-10-10',
        profilePicture: 'test.png'
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

  it('Changing papssword', () => {
    cy.request({
      method: 'PUT',
      url: 'http://localhost:3000/api/user',
      headers: {
        Authorization: token
      },
      body: {
        email,
        password: '123!!!',
        newPassword: '1234!!!'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('Failed to change new password because it is same as old, expect error', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      url: 'http://localhost:3000/api/user',
      headers: {
        Authorization: token
      },
      body: {
        email,
        password: '1234!!!',
        newPassword: '1234!!!'
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  })

  it('Delete User, expected to fail because it requires email and password to delete', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      url: 'http://localhost:3000/api/user',
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(400)
    })
  })

  it('Delete User', () => {
    cy.request({
      method: 'DELETE',
      url: 'http://localhost:3000/api/user',
      headers: {
        Authorization: token
      },
      body: {
        email,
        password: '1234!!!'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('Logging in as deleted User, expected to fail', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: 'http://localhost:3000/api/auth/signin',
      body: {
        email,
        password: '1234!!!'
      }
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })
})

describe('Recommendation Engine Cross', () => {
  var videoIds = []
  var clips = []
  var userId = ''
  var token = ''
  it('Signing Up New User', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/signup',
      body: {
        firstName: 'Test',
        lastName: 'User',
        email,
        username: `${getUniqueId()}`,
        password: '123!!!',
        birthDate: '2000-10-10'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('token')
      token = response.body.token
      cy.request({
        method: 'GET',
        url: `${URL}/user`,
        headers: {
          Authorization: token
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        userId = response.body._id
      })
    })
  })

  it('Creating new videos for sequence', () => {
    cy.task('log', userId)
    function createVideo() {
      cy.request({
        method: 'PUT',
        url: `${URL}/videos`,
        body: {
          title: 'Sample Video',
          description: 'This is a sample video',
          uploader: userId,
          tags: ['sample', 'video'],
          duration: 60,
          thumbnailURL:
            'https://hlsstack-hlsbucketf901f2c8-1wlixklj3wkgx.s3.us-east-1.amazonaws.com/video1sample.png',
          clipTitles: ['Sample Clip1', 'Sample Clip2'],
          clipDescriptions: [
            'This is a sample clip1',
            'This is a sample clip2'
          ],
          clipTags: [
            ['sample1', 'clip1'],
            ['sample2', 'clip2']
          ],
          clipDurations: [60, 60],
          clipThumbnailURLs: [
            'https://hlsstack-hlsbucketf901f2c8-1wlixklj3wkgx.s3.us-east-1.amazonaws.com/clip1sample.png',
            'https://hlsstack-hlsbucketf901f2c8-1wlixklj3wkgx.s3.us-east-1.amazonaws.com/clip2sample.png'
          ],
          clipLinks: [
            'https://hlsstack-hlsbucketf901f2c8-1wlixklj3wkgx.s3.us-east-1.amazonaws.com/iwillsurvive/iwillsurvive.m3u8',
            'https://hlsstack-hlsbucketf901f2c8-1wlixklj3wkgx.s3.us-east-1.amazonaws.com/iwillsurvive/iwillsurvive.m3u8'
          ]
        }
      }).then((createResponse) => {
        expect(createResponse.status).to.eq(200)
        var videoId = createResponse.body.videoId
        cy.request({
          method: 'GET',
          headers: {
            Authorization: token
          },
          url: `${URL}/videos/${videoId}`
        }).then((getResponse) => {
          expect(getResponse.status).to.eq(200)
          clips.push([
            getResponse.body.metadata.clips[0],
            getResponse.body.metadata.clips[1]
          ])
          videoIds.push(videoId)
        })
      })
    }
    createVideo()
    createVideo()
  })

  it('Tries to update the currentSequence with a bad videoId', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      url: `${URL}/user/sequence`,
      body: {
        userId,
        sequence: [{ videoId: 'badid1234567', clipIndex: 0 }, { videoId: 'badid1234567', clipIndex: 0 }]
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  })

  it('Tries to update the currentSequence with a bad clipIndex', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      url: `${URL}/user/sequence`,
      body: {
        userId,
        sequence: [{ videoId: videoIds[0], clipIndex: 2 }, { videoId: videoIds[1], clipIndex: 0 }]
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  })

  it('Updates the currentSequence', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/user/sequence`,
      body: {
        userId,
        sequence: [{ videoId: videoIds[0], clipIndex: 0 }, { videoId: videoIds[1], clipIndex: 0 }]
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('Gets the currentSequence', () => {
    cy.request({
      method: 'GET',
      headers: {
        Authorization: token
      },
      url: `${URL}/user`,
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.currentSequence[0].videoId).to.eq(videoIds[0])
      expect(response.body.currentSequence[0].clipIndex).to.eq(0)
      expect(response.body.currentSequence[1].videoId).to.eq(videoIds[1])
      expect(response.body.currentSequence[1].clipIndex).to.eq(0)
    })
  })
})
