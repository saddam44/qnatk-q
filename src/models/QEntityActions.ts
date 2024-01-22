import { Column, Model, Table } from 'sequelize-typescript';

@Table({
    tableName: 'q_entity_actions',
    timestamps: false,
})
export default class QEntityActions extends Model<QEntityActions> {
    @Column
    BaseModel: string;

    @Column
    Action: string;
}
