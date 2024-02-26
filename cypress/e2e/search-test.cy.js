const URL = 'localhost:3000/api'

describe('Search API Tests', () => {
  it('should return search results for topics', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/search/topics?q=java`,
    }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('results');
        expect(response.body.results).to.be.an('array');
        expect(response.body.results.length).to.be.greaterThan(0);
      });
  });

  it('should return search results for video transcripts', () => {
    cy.request({
      method: 'GET',
      url: `${URL}/search/videos?q=rust`,
    }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('results');
        expect(response.body.results).to.be.an('array');
        expect(response.body.results.length).to.be.greaterThan(0);
      });
  });
});
