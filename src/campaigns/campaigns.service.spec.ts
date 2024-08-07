import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';

describe('CampaignsService', () => {
  let service: CampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignsService],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    const result = new Date(2024, 7, 15);
    expect(service.getDeadlineDate('08.10 ~ 08.15')).toStrictEqual(result);
  });
});
