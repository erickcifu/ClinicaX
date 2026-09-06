import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAppointmentDentists,
  getAppointments,
} from "../api/appointments.api.js";

import ClinicCalendar from "../components/ClinicCalendar.jsx";
import AppointmentFormDialog from "../components/AppointmentFormDialog.jsx";
import AppointmentDetailDialog from "../components/AppointmentDetailDialog.jsx";


export default function AppointmentsPage() {
  const [
    selectedDentist,
    setSelectedDentist,
  ] =
    useState("");


  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState("");


  const [
    range,
    setRange,
  ] =
    useState(null);


  /*
   * ===================================================
   * NUEVA CITA
   * ===================================================
   */
  const [
    appointmentFormOpen,
    setAppointmentFormOpen,
  ] =
    useState(false);


  const [
    initialStart,
    setInitialStart,
  ] =
    useState(null);


  const [
    initialEnd,
    setInitialEnd,
  ] =
    useState(null);


  /*
   * ===================================================
   * DETALLE
   * ===================================================
   */
  const [
    selectedAppointment,
    setSelectedAppointment,
  ] =
    useState(null);


  const [
    detailOpen,
    setDetailOpen,
  ] =
    useState(false);


  /*
   * ===================================================
   * ODONTÓLOGOS
   * ===================================================
   */
  const {
    data:
      dentists = [],
  } =
    useQuery({
      queryKey: [
        "appointment-dentists",
      ],

      queryFn:
        getAppointmentDentists,
    });


  /*
   * ===================================================
   * CITAS
   * ===================================================
   */
  const {
    data:
      appointments = [],

    isLoading,

    isError,

    error,
  } =
    useQuery({
      queryKey: [
        "appointments",
        range?.from,
        range?.to,
        selectedDentist,
        selectedStatus,
      ],

      queryFn: () =>
        getAppointments({
          from:
            range?.from,

          to:
            range?.to,

          dentistId:
            selectedDentist ||
            undefined,

          status:
            selectedStatus ||
            undefined,
        }),

      enabled:
        Boolean(
          range?.from &&
          range?.to
        ),
    });


  function openNewAppointment() {
    setInitialStart(
      null
    );

    setInitialEnd(
      null
    );

    setAppointmentFormOpen(
      true
    );
  }


  function openAppointmentFromCalendar(
    selection
  ) {
    setInitialStart(
      selection.start
    );

    setInitialEnd(
      selection.end
    );

    setAppointmentFormOpen(
      true
    );
  }


  function openAppointmentDetail(
    appointment
  ) {
    setSelectedAppointment(
      appointment
    );

    setDetailOpen(
      true
    );
  }


  function handleAppointmentUpdated(
    updatedAppointment
  ) {
    /*
     * Actualizamos también el dato
     * actualmente mostrado en el diálogo.
     */
    setSelectedAppointment(
      updatedAppointment
    );
  }


  return (
    <Container
      maxWidth="xl"
      sx={{
        py: {
          xs: 2,
          md: 4,
        },
      }}
    >

      <Stack spacing={3}>

        <Box>

          <Typography
            variant="h4"
            fontWeight={800}
          >
            Agenda
          </Typography>


          <Typography
            color="text.secondary"
          >
            Gestión visual de citas de la clínica
          </Typography>

        </Box>


        {isError && (
          <Alert severity="error">
            {error
              ?.response
              ?.data
              ?.error
              ?.message ||
              "No fue posible cargar la agenda"}
          </Alert>
        )}


        {isLoading && (
          <Box
            sx={{
              py: 1,

              display:
                "flex",

              justifyContent:
                "center",
            }}
          >
            <CircularProgress
              size={26}
            />
          </Box>
        )}


        <ClinicCalendar
          appointments={
            appointments
          }

          dentists={
            dentists
          }

          selectedDentist={
            selectedDentist
          }

          selectedStatus={
            selectedStatus
          }

          onDentistChange={
            setSelectedDentist
          }

          onStatusChange={
            setSelectedStatus
          }

          onRangeChange={
            setRange
          }

          onNewAppointment={
            openNewAppointment
          }

          onDateSelect={
            openAppointmentFromCalendar
          }

          onAppointmentClick={
            openAppointmentDetail
          }
        />


        <AppointmentFormDialog
          open={
            appointmentFormOpen
          }

          dentists={
            dentists
          }

          initialStart={
            initialStart
          }

          initialEnd={
            initialEnd
          }

          onClose={() => {
            setAppointmentFormOpen(
              false
            );

            setInitialStart(
              null
            );

            setInitialEnd(
              null
            );
          }}
        />


        <AppointmentDetailDialog
          open={
            detailOpen
          }

          appointment={
            selectedAppointment
          }

          onAppointmentUpdated={
            handleAppointmentUpdated
          }

          onClose={() => {
            setDetailOpen(
              false
            );

            setSelectedAppointment(
              null
            );
          }}
        />

      </Stack>

    </Container>
  );
}