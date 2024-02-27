const { fail } = require("assert");

const URL = 'localhost:3000/api'

describe('Search API Tests', () => {
  it('should return search results for topics', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/search?topic=java`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('results');
      expect(response.body.results).to.have.property('videos');
      expect(response.body.results).to.have.property('topics');
      expect(response.body.results.videos).to.be.an('array');
      expect(response.body.results.videos.length).to.be.greaterThan(0);
      expect(response.body.results.topics).to.be.an('array');
      expect(response.body.results.topics.length).to.be.greaterThan(0);
      });
  });

  it('should return search results for video transcripts', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/search?q=rust`,
    }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('results');
        expect(response.body.results).to.have.property('videos');
        expect(response.body.results).to.have.property('topics');
        expect(response.body.results.videos).to.be.an('array');
        expect(response.body.results.videos.length).to.be.greaterThan(0);
        expect(response.body.results.topics).to.be.an('array');
        expect(response.body.results.topics.length).to.be.greaterThan(0);
      });
  });

  it('should fail (400); no query or topic given', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/search`,
      failOnStatusCode: false
    }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.eq('No query or topic provided');
      });
  });
});
