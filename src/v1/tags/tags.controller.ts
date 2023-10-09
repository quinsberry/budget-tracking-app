import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Controller()
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Post()
    create(@Body() createTagDto: CreateTagDto) {
        return this.tagsService.createOne(createTagDto);
    }

    @Get()
    findAll() {
        return this.tagsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tagsService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tagsService.remove(+id);
    }
}
