import * as React from 'react';
import Paper from '@mui/material/Paper';
import { db } from '../firebase/firebase'; // Import Firebase Firestore
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { EditingState } from '@devexpress/dx-react-scheduler';
import { IntegratedEditing } from '@devexpress/dx-react-scheduler';

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
import { ViewState } from '@devexpress/dx-react-scheduler';

const currentDate = '2024-09-05'; // aktualna data

export default function Calendar() {
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        const fetchEvents = async () => {
            try {
                console.log("Pobieranie wydarzeń z Firestore...");
                const querySnapshot = await getDocs(collection(db, "events"));
                const events = querySnapshot.docs.map(doc => {
                    const eventData = doc.data();
                    return {
                        id: doc.id,
                        ...eventData,
                        startDate: eventData.startDate.toDate(),  // Konwersja Timestamp do Date
                        endDate: eventData.endDate.toDate(),
                    };
                });
                console.log("Wydarzenia pobrane z Firestore:", events); // debugowanie
                setData(events);
            } catch (e) {
                console.error("Błąd podczas pobierania wydarzeń:", e);
            }
        };
        fetchEvents().catch(error => console.error("Błąd w fetchEvents:", error));
    }, []);

    const commitChanges = async ({ added, changed, deleted }) => {
        let updatedData = data;

        if (added) {
            try {
                console.log("Dodawanie:", added); // debugowanie
                const docRef = await addDoc(collection(db, "events"), added);
                updatedData = [...data, { id: docRef.id, ...added }];
            } catch (e) {
                console.error("Błąd podczas dodawania dokumentu:", e);
            }
        }

        if (changed) {
            updatedData = data.map(appointment => {
                if (changed[appointment.id]) {
                    const updatedAppointment = { ...appointment, ...changed[appointment.id] };
                    const docRef = doc(db, "events", appointment.id);
                    updateDoc(docRef, updatedAppointment).catch(error => console.error("Błąd podczas aktualizacji dokumentu:", error));  // debugowanie
                    return updatedAppointment;
                }
                return appointment;
            });
        }

        if (deleted !== undefined) {
            try {
                console.log("Usuwanie wydarzenia o ID:", deleted); //debugowanie
                const docRef = doc(db, "events", deleted);
                await deleteDoc(docRef);
                updatedData = data.filter(appointment => appointment.id !== deleted);
            } catch (e) {
                console.error("Błąd podczas usuwania dokumentu:", e);
            }
        }

        console.log("Zaktualizowane dane:", updatedData); //debugowanie
        setData(updatedData);
    };

    return (
        <Paper>
            <Scheduler data={data} locale="pl-PL">
                <ViewState defaultCurrentDate={currentDate} />
                <EditingState onCommitChanges={commitChanges} />
                <IntegratedEditing />
                <DayView startDayHour={9} endDayHour={14} />
                <WeekView startDayHour={9} endDayHour={14} />
                <MonthView />
                <Toolbar />
                <DateNavigator />
                <ViewSwitcher />
                <Appointments />
                <AppointmentTooltip showOpenButton showDeleteButton />
                <AppointmentForm />
            </Scheduler>
        </Paper>
    );
}
