import { Test, TestingModule } from '@nestjs/testing';
import { BiometricJobsService } from './biometric-jobs.service';

describe('BiometricJobsService', () => {
  let service: BiometricJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BiometricJobsService],
    }).compile();

    service = module.get<BiometricJobsService>(BiometricJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
