import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

@Schema()
class MedicalRecord {
    @Prop({default: Date.now}) date: Date;
    @Prop({required: true}) symptoms: string;
    @Prop({required: true}) diagnosis: string;
    @Prop() treatment: string;
    @Prop({type: Types.ObjectId, ref: 'User'}) doctorId: Types.ObjectId;
}

@Schema({timestamps: true})
export class MedicalCard extends Document {
    @Prop({type: Types.ObjectId, ref: 'User', required: true, unique: true}) patientId: Types.ObjectId;
    @Prop([String]) allergies: string[];
    @Prop([String]) chronicDiseases: string[];
    @Prop({type: [MedicalRecord], default: []}) records: MedicalRecord[];
}

export const MedicalCardSchema = SchemaFactory.createForClass(MedicalCard);
export type MedicalCardDocument = MedicalCard & Document;