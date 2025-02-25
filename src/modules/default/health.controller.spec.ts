import { Test } from '@nestjs/testing';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let testHealthController: HealthController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [HealthController],
    }).compile();

    testHealthController = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(testHealthController).toBeDefined();
  });

  it.todo('base');
});
