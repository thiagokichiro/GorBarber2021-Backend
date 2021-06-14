import { startOfHour } from 'date-fns';
import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Appointment from '../models/Appointment';
import AppointmentRepository from '../repositories/AppointmentRepository';

interface RequestDTO {
  provider_id: string;
  date: Date;
}

class CreateAppointmentService {
  // Recebimento de informações
  public async execute({
    date,
    provider_id,
  }: RequestDTO): Promise<Appointment> {
    const appointmentRepository = getCustomRepository(AppointmentRepository);

    // Arredonda horário de agendamento para ser de hora em hora
    const appointmentDate = startOfHour(date);

    const findAppointmentInSameDate = await appointmentRepository.findByDate(
      appointmentDate,
    );

    if (findAppointmentInSameDate) {
      throw new AppError('This appointment is already booked');
    }

    // cria instância de appointment (não é necessário await)
    const appointment = appointmentRepository.create({
      provider_id,
      date: appointmentDate,
    });

    // salva appointment no banco de dados
    await appointmentRepository.save(appointment);

    return appointment;
  }
}
export default CreateAppointmentService;
