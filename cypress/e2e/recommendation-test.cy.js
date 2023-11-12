const URL = 'localhost:3000/api'
const username = Cypress._.uniqueId(Date.now().toString())
const email = `${username}@test.com`

describe('Precomputed Recommendations', () => {
  var videoIds = []
  var clips = []
  var topicIds = []
  var combinedTopicNames = [
    "Science/Biology",
    "Science2/Biology2"
  ]
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

  it('Deletes topics if they exist', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      url: `${URL}/topics`,
      body: {
        combinedTopicName: combinedTopicNames[0]
      }
    })

    cy.request({
      failOnStatusCode: false,
      method: 'DELETE',
      url: `${URL}/topics`,
      body: {
        combinedTopicName: combinedTopicNames[1]
      }
    })

  })
  
  it('Creating a new topics for recommendations, test if GET works for both ID and name', () => {
    var topicName = combinedTopicNames[0].split('/')[0]
    var subTopicName = combinedTopicNames[0].split('/')[1]
    var topicName2 = combinedTopicNames[1].split('/')[0]
    var subTopicName2 = combinedTopicNames[1].split('/')[1]

    cy.request({
      method: 'POST',
      url: `${URL}/topics`,
      body: {
        "topicName": `${topicName}`,
        "subTopicName": `${subTopicName}`,
        "description": "The study of living organisms, divided into many specialized fields that cover their morphology, physiology, anatomy, behavior, origin, and distribution.",
        "thumbnailURL": "https://example.com/thumbnails/biology.png"
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      topicIds.push(response.body.topic._id)
    }).then(() => {
      cy.request({
        method: 'GET',
        url: `${URL}/topics?combinedTopicName=${combinedTopicNames[0]}`,
        headers: {
          Authorization: token
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.topic.topicName).to.eq(`${topicName}`)
        expect(response.body.topic.subTopicName).to.eq(`${subTopicName}`)
        expect(response.body.topic.description).to.eq(
          'The study of living organisms, divided into many specialized fields that cover their morphology, physiology, anatomy, behavior, origin, and distribution.'
        )
        expect(response.body.topic.thumbnailURL).to.eq(
          'https://example.com/thumbnails/biology.png'
        )
      })
    })

    cy.request({
      method: 'POST',
      url: `${URL}/topics`,
      body: {
        "topicName": `${topicName2}`,
        "subTopicName": `${subTopicName2}`,
        "description": "The study of living organisms",
        "thumbnailURL": "https://example.com/thumbnails/biology2.png"
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      topicIds.push(response.body.topic._id)
    }).then(() => {
      cy.request({
        method: 'GET',
        url: `${URL}/topics?topicId=${topicIds[1]}`,
        headers: {
          Authorization: token
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.topic.topicName).to.eq(`${topicName2}`)
        expect(response.body.topic.subTopicName).to.eq(`${subTopicName2}`)
        expect(response.body.topic.description).to.eq(
          'The study of living organisms'
        )
        expect(response.body.topic.thumbnailURL).to.eq(
          'https://example.com/thumbnails/biology2.png'
        )
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

  it('Creating new recommendations', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/recommendations/precomputed`,
      body: {
        userId,
        combinedTopicName: combinedTopicNames[0],
        recommendations: videoIds
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    }).then(() => {
      cy.request({
        method: 'GET',
        url: `${URL}/recommendations/precomputed?userId=${userId}`,
        headers: {
          Authorization: token
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.recommendation.topicSequences[combinedTopicNames[0]][0]).to.eq(videoIds[0])
        expect(response.body.recommendation.topicSequences[combinedTopicNames[0]][1]).to.eq(videoIds[1])
        
      })
    })

    cy.request({
      method: 'PUT',
      url: `${URL}/recommendations/precomputed`,
      body: {
        userId,
        combinedTopicName: combinedTopicNames[1],
        recommendations: [videoIds[1]]
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    }
    ).then(() => {
      cy.request({
        method: 'GET',
        url: `${URL}/recommendations/precomputed?userId=${userId}`,
        headers: {
          Authorization: token
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.recommendation.topicSequences[combinedTopicNames[1]][0]).to.eq(videoIds[1])
      })
    })
  })

  it('Gets playlist recommendations for a topic by name', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/recommendations/playlist?combinedTopicName=${combinedTopicNames[0]}&numPlaylists=2`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.playlists[0]._id).to.eq(videoIds[0])
      expect(response.body.playlists[1]._id).to.eq(videoIds[1])
    })
  })

  it('Gets playlist recommendations for another topic by Id', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/recommendations/playlist?combinedTopicName=${combinedTopicNames[1]}&numPlaylists=2`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.playlists[0]._id).to.eq(videoIds[1])
    })
  })

  it('Tried to get too many playlist recommendations for a topic', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      url: `${URL}/recommendations/playlist?combinedTopicName=${combinedTopicNames[0]}&topicId=${topicIds[0]}&numPlaylists=3`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.eq('Success, but could not find all playlists or too many queried')
      expect(response.body.playlists[0]._id).to.eq(videoIds[0])
      expect(response.body.playlists[1]._id).to.eq(videoIds[1])
    })
  })

  it('Gets a list of topic recommendations', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/recommendations/topics`,
      headers: {
        Authorization: token
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      cy.task('log', response.body)
    })
  })

})