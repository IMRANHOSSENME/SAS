import { Test, TestingModule } from '@nestjs/testing';
import { BiometricJobsController } from './biometric-jobs.controller';

describe('BiometricJobsController', () => {
  let controller: BiometricJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BiometricJobsController],
    }).compile();

    controller = module.get<BiometricJobsController>(BiometricJobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
