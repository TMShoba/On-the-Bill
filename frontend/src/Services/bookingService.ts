import { api } from "./api";
import type { Booking, BookingStatus } from "../Types/Artist";

export type CreateBookingPayload = {
  artistId: string;
  clientName: string;
  clientEmail: string;
  eventDate: string;
  venue?: string;
  message?: string;
};

export async function createBooking(
  payload: CreateBookingPayload
): Promise<Booking> {
  const { data } = await api.post<Booking>("/bookings", payload);
  return data;
}

export async function getBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>("/bookings");
  return data;
}

export async function updateBookingStatusApi(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  const { data } = await api.patch<Booking>(`/bookings/${id}`, { status });
  return data;
}
