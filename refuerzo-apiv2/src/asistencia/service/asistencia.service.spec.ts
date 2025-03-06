import { Test, TestingModule } from '@nestjs/testing';
import { AsistenciaService } from './asistencia.service';

describe('AsistenciaService', () => {
  let service: AsistenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsistenciaService],
    }).compile();

    service = module.get<AsistenciaService>(AsistenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
