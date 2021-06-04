import { Module } from '@nestjs/common';
import { SequenceService } from './sequence.service';
import {SequenceSchema} from './sequence.model';
import {MongooseModule} from '@nestjs/mongoose';
import {UploadService} from '../upload/upload.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Sequence', schema: SequenceSchema}])],
    providers: [SequenceService,UploadService]
})
export class SequenceModule {}
