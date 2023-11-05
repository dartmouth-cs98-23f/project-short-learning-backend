const URL = 'localhost:3000/api'
const username = Cypress._.uniqueId(Date.now().toString())
const email = `${username}@test.com`
let token = ''

describe('Video Metadata', () => {
  var videoId = ''
  var commentId = ''
  var nestedComment = ''
  var userId = ''
  var clips = []

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

  it('Creating a new video', () => {
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
        headers: {
          Authorization: token
        },
        url: `${URL}/videos/${videoId}`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        clips = getResponse.body.metadata.clips
      })
    })
  })

  it('Liking a video', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/videos/${videoId}/like`,
      body: {
        userId: userId
      }
    }).then((likeResponse) => {
      expect(likeResponse.status).to.eq(200)
      expect(likeResponse.body.likes).to.eq(1)
      cy.request({
        method: 'GET',
        headers: {
          Authorization: token
        },
        url: `${URL}/videos/${videoId}`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expect(getResponse.body.metadata.likes.length).to.eq(1)
        expect(getResponse.body.metadata.likes[0]).to.eq(userId)
      })
    })
  })

  it('Disliking a video', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/videos/${videoId}/dislike`,
      body: {
        userId: userId
      }
    }).then((dislikeResponse) => {
      expect(dislikeResponse.status).to.eq(200)
      expect(dislikeResponse.body.dislikes).to.eq(1)
      cy.request({
        method: 'GET',
        headers: {
          Authorization: token
        },
        url: `${URL}/videos/${videoId}`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expect(getResponse.body.metadata.dislikes.length).to.eq(1)
        expect(getResponse.body.metadata.dislikes[0]).to.eq(userId)
      })
    })
  })

  it('Commenting on a video', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/videos/${videoId}/comment`,
      body: {
        userId: userId,
        text: 'This is a comment'
      }
    }).then((commentResponse) => {
      expect(commentResponse.status).to.eq(200)
      expect(commentResponse.body.totalComments).to.eq(1)
      cy.request({
        method: 'GET',
        headers: {
          Authorization: token
        },
        url: `${URL}/videos/${videoId}/comments`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expect(getResponse.body.totalComments).to.eq(1)
        expect(getResponse.body.comments.length).to.eq(1)
        expect(getResponse.body.comments[0].text).to.eq('This is a comment')
        commentId = getResponse.body.comments[0]._id
      })
    })
  })

  it('Adding a like to a comment', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/videos/${videoId}/comment/${commentId}/like`,
      body: {
        userId: userId
      }
    }).then((likeResponse) => {
      expect(likeResponse.status).to.eq(200)
      expect(likeResponse.body.likes).to.eq(1)
      cy.request({
        method: 'GET',
        headers: {
          Authorization: token
        },
        url: `${URL}/videos/${videoId}/comments`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expect(getResponse.body.comments[0].likes.length).to.eq(1)
        expect(getResponse.body.comments[0].likes[0]).to.eq(userId)
      })
    })
  })

  it('Commenting on a comment', () => {
    cy.request({
      method: 'POST',
      headers: {
        Authorization: token
      },
      url: `${URL}/videos/${videoId}/comment`,
      body: {
        userId: userId,
        text: 'This is a comment on a comment',
        parentCommentId: commentId
      }
    }).then((commentResponse) => {
      expect(commentResponse.status).to.eq(200)
      expect(commentResponse.body.totalComments).to.eq(2)
      cy.request({
        method: 'GET',
        headers: {
          Authorization: token
        },
        url: `${URL}/videos/${videoId}/comments`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expect(getResponse.body.totalComments).to.eq(2)
        expect(getResponse.body.comments.length).to.eq(1)
        expect(getResponse.body.comments[0].nestedComments.length).to.eq(1)
        expect(getResponse.body.comments[0].nestedComments[0].text).to.eq(
          'This is a comment on a comment'
        )
        nestedComment = getResponse.body.comments[0].nestedComments[0]._id
      })
    })
  })

  it('Deleting a comment, with the nested one as well', () => {
    cy.request({
      method: 'DELETE',
      url: `${URL}/videos/${videoId}/comment/${commentId}`
    }).then((deleteResponse) => {
      expect(deleteResponse.status).to.eq(200)
      cy.request({
        method: 'GET',
        headers: {
          Authorization: token
        },
        url: `${URL}/videos/${videoId}/comments`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200)
        expect(getResponse.body.totalComments).to.eq(0)
        expect(getResponse.body.comments.length).to.eq(0)
      })
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
