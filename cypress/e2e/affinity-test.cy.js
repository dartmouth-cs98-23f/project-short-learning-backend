const URL = 'http://localhost:3000/api'
const getUniqueId = () => {
  return Cypress._.uniqueId(Date.now().toString())
}
const email = `${getUniqueId()}@test.com`
let token = ''

describe('User Affinity Test', () => {
  it('Signing Up New User to Test Affinity', () => {
    cy.request({
      method: 'POST',
      url: `${URL}/auth/signup`,
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

  it('Creating a new affinity for user', () => {
    cy.request({
      method: 'POST',
      url: `${URL}/user/affinities`,
      headers: {
        Authorization: token
      },
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Artificial Intelligence',
            affinityValue: 0.1
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('affinities')
      expect(response.body).to.have.property('userId')
    })
  })

  it('Posting bad affinity for user with bad topic/subtopic combo, expected to fail', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: `${URL}/user/affinities`,
      headers: {
        Authorization: token
      },
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Machine Learning',
            affinityValue: 0.1
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  })

  it('Gets all affinities for user', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/user/affinities`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(Object.values(response.body.affinities).length).to.eq(1)
      expect(
        response.body.affinities['Technology/Artificial Intelligence']
      ).to.have.equal(0.1)
    })
  })

  it('Updating affinities for user by updating a specific affinity', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/user/affinities/`,
      headers: {
        Authorization: token
      },
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Artificial Intelligence',
            affinityValue: 0.2
          }
        ]
      }
    }).then((response) => {
      console.log(response.body)
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('affinities')
      expect(Object.values(response.body.affinities).length).to.eq(1)
      expect(
        response.body.affinities['Technology/Artificial Intelligence']
      ).to.eq(0.2)
    })
  })

  it('Updating affinities for user by adding an additional affinity', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/user/affinities`,
      headers: {
        Authorization: token
      },
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Hardware',
            affinityValue: 0.95
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('affinities')
      expect(Object.values(response.body.affinities).length).to.eq(2)
      expect(response.body.affinities['Technology/Hardware']).to.eq(0.95)
    })
  })

  it('Updating an affinity for user, expected to fail because affinity does not exist in truth table', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      url: `${URL}/user/affinities/`,
      headers: {
        Authorization: token
      },
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Banana',
            affinityValue: 0.95
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  })

  it('Deleting an affinity for user', () => {
    cy.request({
      method: 'DELETE',
      url: `${URL}/user/affinities/`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('Deleting an affinity for user, expected to fail because affinity does not exist', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      url: `${URL}/user/affinities/`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  })

  it('Deleting user', () => {
    cy.request({
      method: 'DELETE',
      url: `${URL}/user/`,
      headers: {
        Authorization: token
      },
      body: {
        email,
        password: '123!!!'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
})

let videoId = ''
let clips = []
describe('Video Affinity Test', () => {
  it('Creating a new video', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/videos`,
      body: {
        title: 'Sample Video',
        description: 'This is a sample video',
        uploader: '123456789101112131415161',
        tags: ['sample', 'video'],
        duration: 60,
        thumbnailURL:
          'https://hlsstack-hlsbucketf901f2c8-1wlixklj3wkgx.s3.us-east-1.amazonaws.com/video1sample.png',
        clipTitles: ['Sample Clip1', 'Sample Clip2'],
        clipDescriptions: ['This is a sample clip1', 'This is a sample clip2'],
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
      videoId = createResponse.body.videoId
      cy.request({
        method: 'GET',
        url: `${URL}/videos/${videoId}`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        clips = getResponse.body.metadata.clips
      })
    })
  })

  it('Creating a new affinity for video', () => {
    cy.request({
      method: 'POST',
      url: `${URL}/videos/${videoId}/affinities`,
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Artificial Intelligence',
            affinityValue: 0.1
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('affinities')
      expect(response.body).to.have.property('videoId')
    })
  })

  it('Posting bad affinity for video with bad topic/subtopic combo, expected to fail', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: `${URL}/videos/${videoId}/affinities`,
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Machine Learning',
            affinityValue: 0.1
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  })

  it('Gets all affinities for video', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/videos/${videoId}/affinities`
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(Object.values(response.body.affinities).length).to.eq(1)
      expect(
        response.body.affinities['Technology/Artificial Intelligence']
      ).to.have.equal(0.1)
    })
  })

  it('Updating affinities for video by updating a specific affinity', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/videos/${videoId}/affinities`,
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Artificial Intelligence',
            affinityValue: 0.2
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('affinities')
      expect(Object.values(response.body.affinities).length).to.eq(1)
      expect(
        response.body.affinities['Technology/Artificial Intelligence']
      ).to.eq(0.2)
    })
  })

  it('Updating affinities for video by adding an additional affinity', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/videos/${videoId}/affinities`,
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Hardware',
            affinityValue: 0.95
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('affinities')
      expect(Object.values(response.body.affinities).length).to.eq(2)
      expect(response.body.affinities['Technology/Hardware']).to.eq(0.95)
    })
  })

  it('Updating an affinity for video, expected to fail because affinity does not exist in truth table', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'PUT',
      url: `${URL}/videos/${videoId}/affinities`,
      body: {
        affinities: [
          {
            topic: 'Technology',
            subTopic: 'Banana',
            affinityValue: 0.95
          }
        ]
      }
    }).then((response) => {
      expect(response.status).to.eq(422)
    })
  })

  it('Deleting an affinity for video', () => {
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId}/affinities`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('Deleting a video', () => {
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId}`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
})
