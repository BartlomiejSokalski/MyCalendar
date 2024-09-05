import * as React from 'react';
import Paper from '@mui/material/Paper';
import { db } from '../firebase/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, Timestamp } from "firebase/firestore";
import { EditingState, ViewState, IntegratedEditing } from '@devexpress/dx-react-scheduler';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';


import {
    Scheduler,
    DayView,
    WeekView,
    MonthView,
    Appointments,
    Toolbar,
    DateNavigator,
    ViewSwitcher,
    AppointmentForm,
    AppointmentTooltip,
} from '@devexpress/dx-react-scheduler-material-ui';
import { Alert } from '@mui/material';

const getCurrentDate = () => new Date().toISOString().split('T')[0];

export default function Calendar() {
    const [data, setData] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const fetchEvents = React.useCallback(async () => {
        try {
            setLoading(true)
            setError(null);
            console.log("Fetching events from Firestore...");
            const querySnapshot = await getDocs(collection(db, "events"));
            const events = querySnapshot.docs.map(doc => {
                const eventData = doc.data();
                return {
                    id: doc.id,
                    ...eventData,
                    startDate: eventData.startDate instanceof Timestamp ? eventData.startDate.toDate() : new Date(eventData.startDate),
                    endDate: eventData.endDate instanceof Timestamp ? eventData.endDate.toDate() : new Date(eventData.endDate),
                };
            });
            console.log("Events fetched from Firestore:", events);
            setData(events);
        } catch (e) {
            console.error("Error fetching events:", e);
            setError("Failed to load events. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const commitChanges = async ({ added, changed, deleted }) => {
        try {
            let updatedData = [...data];

            if (added) {
                console.log("Adding:", added);
                const docRef = await addDoc(collection(db, "events"), added);
                updatedData.push({ id: docRef.id, ...added });
            }

            if (changed) {
                updatedData = updatedData.map(appointment => {
                    if (changed[appointment.id]) {
                        const updatedAppointment = { ...appointment, ...changed[appointment.id] };
                        const docRef = doc(db, "events", appointment.id);
                        updateDoc(docRef, updatedAppointment).catch(error => {
                            console.error("Error updating document:", error);
                            setError("Failed to update event. Please try again.");
                        });
                        return updatedAppointment;
                    }
                    return appointment;
                });
            }

            if (deleted !== undefined) {
                console.log("Deleting event with ID:", deleted);
                const docRef = doc(db, "events", deleted);
                await deleteDoc(docRef);
                updatedData = updatedData.filter(appointment => appointment.id !== deleted);
            }

            console.log("Updated data:", updatedData);
            setData(updatedData);
        } catch (e) {
            console.error("Error committing changes:", e);
            setError("Failed to save changes. Please try again.");
        }
    };

    if (loading) return <Paper><p>Loading calendar...</p></Paper>;

    return (
        <Paper>
            {error && <Alert severity="error">{error}</Alert>}
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <Scheduler data={data} locale="en-US">
                    <ViewState defaultCurrentDate={getCurrentDate()} />
                    <EditingState onCommitChanges={commitChanges} />
                    <IntegratedEditing />
                    <DayView startDayHour={9} endDayHour={18} />
                    <WeekView startDayHour={9} endDayHour={18} />
                    <MonthView />
                    <Toolbar />
                    <DateNavigator />
                    <ViewSwitcher />
                    <Appointments />
                    <AppointmentTooltip showOpenButton showDeleteButton />
                    <AppointmentForm />
                </Scheduler>
            </LocalizationProvider>
        </Paper>
    );
}