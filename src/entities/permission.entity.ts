import { Column, Entity } from 'typeorm'

import { Base } from './base.entity'

@Entity()
export class Permission extends Base {
  @Column()
  name: string
}
