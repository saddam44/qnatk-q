import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import QRoles from './QRoles';
import QEntityActions from './QEntityActions';

@Table({
    tableName: 'q_permissions',
    timestamps: false,
})
export default class QPermissions extends Model<QPermissions> {
    @ForeignKey(() => QEntityActions)
    @Column
    entity_action_id: string;

    @ForeignKey(() => QRoles)
    @Column
    role_id: string;

    @Column
    from_ips: string;
}

// create sql to generate this table
