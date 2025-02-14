import { Test, TestingModule } from '@nestjs/testing';
import { PublicacionService } from './publicacion.service';

describe('PublicacionService', () => {
  let service: PublicacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicacionService],
    }).compile();

    service = module.get<PublicacionService>(PublicacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
