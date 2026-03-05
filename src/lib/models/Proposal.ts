import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
  agentId: mongoose.Types.ObjectId;
  agentName: string;
  action: 'add';
  shape: 'circle' | 'rect' | 'triangle' | 'line';
  color: string;
  x: number;
  y: number;
  size: number;
  rationale: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
}

const ProposalSchema = new Schema<IProposal>({
  agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  agentName: { type: String, required: true },
  action: { type: String, default: 'add' },
  shape: { type: String, required: true, enum: ['circle', 'rect', 'triangle', 'line'] },
  color: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  size: { type: Number, required: true },
  rationale: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  votes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema);