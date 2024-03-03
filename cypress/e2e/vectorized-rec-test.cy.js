const { fail } = require("assert");

const URL = 'localhost:3000/api'

describe('Pinecone Vector Recommendation Tests', () => {
  it('video should be its own top recommendation (cosine similarity = 1)', () => {
    const videoId = "65d8fc6e95f306b28d1b8961"
    cy.request({
      method: 'GET',
      url: `${URL}/vectorized-recommendations?videoId=${videoId}`,
    }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('results');
        expect(response.body.results).to.have.property('videos');
        expect(response.body.results.videos).to.be.an('array');
        expect(response.body.results.videos.length).to.be.greaterThan(0);
        expect(response.body.results.videos[0].videoId).to.eq(videoId);
      });
  });

  it('Nonexistent Video Should Return Error', () => {
    const videoId = "nonexistent-id"
    cy.request({
      method: 'GET',
      url: `${URL}/vectorized-recommendations?videoId=${videoId}`,
      failOnStatusCode: false
    }).then((response) => {
        expect(response.status).to.eq(500);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.eq(`Video ${videoId} not found`);
      });
  });
});
