import { Test, TestingModule } from '@nestjs/testing';
import { GradoService } from './grado.service';

describe('GradoService', () => {
  let service: GradoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradoService],
    }).compile();

    service = module.get<GradoService>(GradoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
