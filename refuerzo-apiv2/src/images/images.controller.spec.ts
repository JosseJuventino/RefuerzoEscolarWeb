import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from './images.controller';
import { ImageService } from './images.service';

describe('ImagesController', () => {
  let controller: ImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [ImageService],
    }).compile();

    controller = module.get<ImageController>(ImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
