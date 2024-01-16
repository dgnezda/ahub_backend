import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common'
import { Role } from 'entities/role.entity'
import { PaginatedResult } from 'interfaces/paginated-result.interface'

import { CreateUpdateRoleDto } from './dto/create-update-role.dto'
import { RolesService } from './roles.service'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiCreatedResponse({ description: 'List all roles.' })
  @ApiBadRequestResponse({ description: 'Error for list of roles.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll(['permissions'])
  }

  @ApiCreatedResponse({ description: 'Paginates roles.' })
  @ApiBadRequestResponse({ description: 'Error for paginating roles.' })
  @Get('/paginated')
  @HttpCode(HttpStatus.OK)
  async paginated(@Query('page') page: number): Promise<PaginatedResult> {
    return this.rolesService.paginate(page, ['permissions'])
  }

  @ApiCreatedResponse({ description: 'Finds role by ID.' })
  @ApiBadRequestResponse({ description: 'Error for finding role by ID.' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Role> {
    return this.rolesService.findById(id, ['permissions'])
  }

  @ApiCreatedResponse({ description: 'Creates new role.' })
  @ApiBadRequestResponse({ description: 'Error for creating new role.' })
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createRoleDto: CreateUpdateRoleDto,
    @Body('permissions') permissionsIds: string[],
  ): Promise<Role> {
    // Format data: [1, 2] ==> [{id: 1}, {id: 2}] --- .map() function!
    return this.rolesService.create(
      createRoleDto,
      permissionsIds.map((id) => ({
        id,
      })),
    )
  }

  @ApiCreatedResponse({ description: 'Updates a role.' })
  @ApiBadRequestResponse({ description: 'Error for updating a role.' })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: CreateUpdateRoleDto,
    @Body('permissions') permissionsIds: string[],
  ): Promise<Role> {
    // Format data: [1, 2] ==> [{id: 1}, {id: 2}] --- .map() function!
    return this.rolesService.update(
      id,
      updateRoleDto,
      permissionsIds.map((id) => ({
        id,
      })),
    )
  }

  @ApiCreatedResponse({ description: 'Deletes a role.' })
  @ApiBadRequestResponse({ description: 'Error for deleting a role.' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Role> {
    return this.rolesService.remove(id)
  }
}
