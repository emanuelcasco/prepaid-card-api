import { Redis } from 'ioredis';

const mockedRedis = jest.genMockFromModule('ioredis') as jest.Mock<Redis>;

mockedRedis.prototype.get = jest.fn().mockResolvedValue(null);
mockedRedis.prototype.set = jest.fn().mockResolvedValue(null);

export default mockedRedis;
