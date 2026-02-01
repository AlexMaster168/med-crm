import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

@Schema({timestamps: true})
export class FamilyDoctor extends Document {
    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    patientId: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    doctorId: Types.ObjectId;

    @Prop({required: true, default: Date.now})
    contractDate: Date;

    @Prop({default: true})
    isActive: boolean;
}

export const FamilyDoctorSchema = SchemaFactory.createForClass(FamilyDoctor);
export type FamilyDoctorDocument = FamilyDoctor & Document;