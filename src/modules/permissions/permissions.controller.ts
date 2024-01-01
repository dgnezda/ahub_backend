import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { Permission } from 'entities/permission.entity'

import { CreatePermissionDto } from './dto/create-permission.dto'
import { PermissionsService } from './permissions.service'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiCreatedResponse({ description: 'List all permissions.' })
  @ApiBadRequestResponse({ description: 'Error for list of permissions.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Permission[]> {
    return this.permissionsService.findAll()
  }

  @ApiCreatedResponse({ description: 'Creates new permission.' })
  @ApiBadRequestResponse({ description: 'Error for creating new permission.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionsService.create(createPermissionDto)
  }

  @ApiCreatedResponse({ description: 'Deletes a role.' })
  @ApiBadRequestResponse({ description: 'Error for deleting a role.' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Permission> {
    return this.permissionsService.remove(id)
  }
}
