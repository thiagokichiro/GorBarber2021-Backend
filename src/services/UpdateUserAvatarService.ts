import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';

import User from '../models/Users';

interface RequestDTO {
  user_id: string;
  avatarFileName: string;
}

class UpdateUserAvatarService {
  public async execute({ user_id, avatarFileName }: RequestDTO): Promise<User> {
    const usersRepository = getRepository(User);
    // valida se é usuário válido
    const user = await usersRepository.findOne(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar', 401);
    }

    if (user.avatar) {
      // deleta avatar anterior
      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);
      // trás o status de um arquivo se ele existir
      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);

      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath);
      }
    }

    user.avatar = avatarFileName;

    // atualiza avatar do usuário
    await usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
