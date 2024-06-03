import { getExpiration } from './get-expiration';

describe('getExpiration', () => {
  it('should return the expiration date and time as an ISO string', () => {
    // Arrange
    const currentDate = new Date();
    const expectedExpiration = new Date(
      currentDate.getTime() + 1000 * 60 * 60 * 24
    ).toISOString();

    // Act
    const result = getExpiration();

    // Assert
    expect(result).toBe(expectedExpiration);
  });
});
