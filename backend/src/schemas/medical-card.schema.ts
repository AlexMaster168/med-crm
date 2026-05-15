import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class MedicalRecord {
    @Prop({ default: Date.now }) date: Date;
    @Prop({ required: true }) symptoms: string;
    @Prop({ required: true }) diagnosis: string;
    @Prop() treatment?: string;
    @Prop() notes?: string;
    @Prop({ type: Types.ObjectId, ref: 'User' }) doctorId: Types.ObjectId;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class MedicalCard extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
    patientId: Types.ObjectId;

    @Prop() bloodType?: string;
    @Prop({ min: 50, max: 250 }) height?: number;
    @Prop({ min: 1, max: 500 }) weight?: number;

    @Prop({ type: [String], default: [] }) allergies: string[];
    @Prop({ type: [String], default: [] }) chronicDiseases: string[];

    @Prop({ type: [MedicalRecordSchema], default: [] }) records: MedicalRecord[];
}

export const MedicalCardSchema = SchemaFactory.createForClass(MedicalCard);
export type MedicalCardDocument = MedicalCard & Document;
