import { UserTypes } from './userTypes';

export interface BookTypes {
    _id: string;
    title: string;
    description: string;
    author: UserTypes;
    genre: string;
    coverImage: string;
    file: string;
}
