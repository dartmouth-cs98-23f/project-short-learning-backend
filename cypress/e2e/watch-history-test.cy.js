const URL = 'http://localhost:3000/api'
const getUniqueId = () => {
  return Cypress._.uniqueId(Date.now().toString())
}
const email = `${getUniqueId()}@test.com`
let token = ''
let videoId1 = ''
let videoId2 = ''
let videoId3 = ''

describe('Watch History Test', () => {
  it('Signing Up New User to Test Watch History', () => {
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
  });

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
      videoId1 = createResponse.body.videoId
    })
  });

  it('Creating a second and third video', () => {
    cy.request({
      method: 'PUT',
      url: `${URL}/videos`,
      body: {
        title: 'Sample Video2',
        description: 'This is a sample video2',
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
      videoId2 = createResponse.body.videoId
    })

    cy.request({
      method: 'PUT',
      url: `${URL}/videos`,
      body: {
        title: 'Sample Video3',
        description: 'This is a sample video3',
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
      videoId3 = createResponse.body.videoId
    })
  });

  it('Inserting new video to watch history', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory/${videoId1}`,
      body: {
        duration: 10.02,
      } 
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });

  it('Inserting second and third video to watch history', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory/${videoId2}`,
      body: {
        duration: 10.02,
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })

    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory/${videoId3}`,
      body: {
        duration: 11.02,
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });

  it('Getting watch history', () => {
    cy.request({
      method: 'GET',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory`
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.lengthOf(3)
      expect(response.body[0]).to.have.property('videoId')
      expect(response.body[0]).to.have.property('date')
    })
  });

  it('Getting watch history', () => {
    cy.request({
      method: 'GET',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory?limit=2`
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.lengthOf(2)
      expect(response.body[0]).to.have.property('videoId')
      expect(response.body[0]).to.have.property('date')
    })
  });

  it('Getting watch history of a specific video', () => {
    cy.request({
      method: 'GET',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory/${videoId1}`
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('videoId')
      expect(response.body).to.have.property('date')
    })
  });

  it('Updating the watch date of a specific video', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      body: {
        duration: 2.02,
      },
      url: `${URL}/watchhistory/${videoId2}`
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('videoId')
      expect(response.body).to.have.property('date')
      expect(response.body).to.have.property('duration')
      expect(response.body.duration).to.eq(2.02)
    })
  });

  // Create video affinity for all 3 videos
  it('Creating video affinity for all 3 videos', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/videos/${videoId1}/affinities`,
      body: {
        affinities: {
          1: 0.2,
          6: 0.5,
          8: 0.3,
          70: 0.2
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })

    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/videos/${videoId2}/affinities`,
      body: {
        affinities: {
          1: 0.5,
          6: 0.3,
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })

    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/videos/${videoId3}/affinities`,
      body: {
        affinities: {
          1: 1,
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });

  it('Dashboard test for user', () => {
    cy.request({
      method: 'GET',
      headers: {
        Authorization: token
      },
      url: `${URL}/dashboard`
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('topicAffinity')
      const topicAffinityKeys = Object.keys(response.body.topicAffinity);
      expect(topicAffinityKeys).to.have.lengthOf(4);
      expect(response.body.topicAffinity[1]).to.eq(3)
      expect(response.body.topicAffinity[6]).to.eq(2)
      expect(response.body.topicAffinity[8]).to.eq(1)
      expect(response.body.topicAffinity[70]).to.eq(1)
    })
  })

  it('Deleting a video from watch history', () => {
    cy.request({
      method: 'DELETE',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory/${videoId1}`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });

  it('Deleting all videos from watch history', () => {
    cy.request({
      method: 'DELETE',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });

  it('No videos in watch history', () => {
    cy.request({
      method: 'GET',
      headers: {
        Authorization: token
      },
      url: `${URL}/watchhistory`
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.lengthOf(0)
    })
  });
  
  it('Deleting all video affinities', () => {
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId1}/affinities`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId2}/affinities`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId3}/affinities`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('Deleting all videos', () => {
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId1}`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId2}`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId3}`
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  });
})
