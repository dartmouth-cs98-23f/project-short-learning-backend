const URL = 'localhost:3000/api'
const username = Cypress._.uniqueId(Date.now().toString())
const email = `${username}@test.com`

describe('Precomputed Recommendations', () => {
  var videoIds = []
  var clips = []
  var userId = ''
  var token = ''

  it('Creating a new test user', () => {
    cy.request({
      method: 'POST',
      url: `${URL}/auth/signup`,
      body: {
        firstName: 'Test',
        lastName: 'User',
        email,
        username,
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
        expect(response.body.email).to.eq(email)
        expect(response.body.username).to.eq(username)
        expect(response.body.firstName).to.eq('Test')
        expect(response.body.lastName).to.eq('User')
        userId = response.body._id
      })
    })
  })

  it('Deleting recommendations if they exist', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      url: `${URL}/recommendations/precomputed`,
      body: {
        userId
      }
    })
  })

  it('Creating new videos for recommendations', () => {
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

  it('Creating a new recommendation, empty', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/recommendations/precomputed`,
      body: {
        userId
      }
    }).then((createResponse) => {
      expect(createResponse.status).to.eq(200)
      expect(createResponse.body.message).to.eq(
        'Created precomputed recommendations'
      )
    })
  })

  it('Getting the new empty recommendation', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/recommendations/precomputed`,
      headers: {
        Authorization: token
      },
      body: {
        userId
      }
    }).then((getResponse) => {
      expect(getResponse.status).to.eq(200)
      expect(
        getResponse.body.recommendations.topVideoRecommendations.length
      ).to.eq(0)
      expect(
        getResponse.body.recommendations.topTopicVideoRecommendations.length
      ).to.eq(0)
    })
  })

  it("Updating the recommendation's topVideoRecommendations", () => {
    const topVideoRecommendations = [
      {
        videoId: videoIds[0],
        clipsIndex: 0
      },
      {
        videoId: videoIds[1],
        clipsIndex: 1
      }
    ]
    cy.request({
      method: 'PUT',
      url: `${URL}/recommendations/precomputed`,
      body: {
        userId,
        topVideoRecommendations
      }
    }).then((updateResponse) => {
      expect(updateResponse.status).to.eq(200)
      expect(updateResponse.body.message).to.eq(
        'Updated precomputed recommendations'
      )
    })
  })

  it("Checking if the recommendation's topVideoRecommendations were updated", () => {
    cy.request({
      method: 'GET',
      headers: {
        Authorization: token
      },
      url: `${URL}/recommendations/precomputed`,
      body: {
        userId
      }
    }).then((getResponse) => {
      expect(getResponse.status).to.eq(200)
      expect(
        getResponse.body.recommendations.topVideoRecommendations.length
      ).to.eq(2)
      expect(
        getResponse.body.recommendations.topTopicVideoRecommendations.length
      ).to.eq(0)

      expect(
        getResponse.body.recommendations.topVideoRecommendations[0].videoId
      ).to.eq(videoIds[0])
      expect(
        getResponse.body.recommendations.topVideoRecommendations[1].videoId
      ).to.eq(videoIds[1])
    })
  })

  it("Updating the recommendation's topTopicVideoRecommendations should fail when the clipsIndex is out of range", () => {
    cy.request({
      method: 'PUT',
      failOnStatusCode: false,
      url: `${URL}/recommendations/precomputed`,
      body: {
        userId,
        topTopicVideoRecommendations: [
          {
            videoId: videoIds[0],
            clipIndex: 2
          }
        ]
      }
    }).then((updateResponse) => {
      expect(updateResponse.status).to.eq(422)
      expect(updateResponse.body.message).to.eq(
        'Invalid recommendations, check the { recommendation_models.ts }'
      )
    })
  })

  it('Updating the recommendation with a bad videoId should fail', () => {
    cy.request({
      method: 'PUT',
      failOnStatusCode: false,
      url: `${URL}/recommendations/precomputed`,
      body: {
        userId,
        topTopicVideoRecommendations: [
          {
            videoId: 'badid',
            clipIndex: 0
          }
        ]
      }
    }).then((updateResponse) => {
      expect(updateResponse.status).to.eq(422)
      expect(updateResponse.body.message).to.eq(
        'Invalid recommendations, check the { recommendation_models.ts }'
      )
    })
  })
})
