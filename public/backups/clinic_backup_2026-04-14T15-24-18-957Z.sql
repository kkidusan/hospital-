--
-- PostgreSQL database dump
--

\restrict nh9yKrASWRIfHfOsNVScUmzm8iiil4Hcdtq5Ep1DLu7G4UIGZ7Sg6hEgRGIQ8qH

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AdmissionSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdmissionSource" AS ENUM (
    'ER',
    'OPD'
);


ALTER TYPE public."AdmissionSource" OWNER TO postgres;

--
-- Name: AdmissionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdmissionStatus" AS ENUM (
    'ACTIVE',
    'TRANSFERRED',
    'DISCHARGED',
    'CANCELLED'
);


ALTER TYPE public."AdmissionStatus" OWNER TO postgres;

--
-- Name: AppointmentPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentPriority" AS ENUM (
    'ROUTINE',
    'URGENT',
    'EMERGENCY'
);


ALTER TYPE public."AppointmentPriority" OWNER TO postgres;

--
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'SCHEDULED',
    'ARRIVED',
    'CANCELLED',
    'COMPLETED',
    'NOSHOW'
);


ALTER TYPE public."AppointmentStatus" OWNER TO postgres;

--
-- Name: AppointmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentType" AS ENUM (
    'INITIAL',
    'FOLLOW_UP',
    'REVIEW',
    'PROCEDURE',
    'OTHER'
);


ALTER TYPE public."AppointmentType" OWNER TO postgres;

--
-- Name: BillingMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BillingMethod" AS ENUM (
    'FIXED',
    'PER_DAY',
    'HOURLY',
    'PACKAGE'
);


ALTER TYPE public."BillingMethod" OWNER TO postgres;

--
-- Name: DischargeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DischargeType" AS ENUM (
    'RECOVERED',
    'REFERRED',
    'DAMA',
    'DECEASED',
    'OTHER'
);


ALTER TYPE public."DischargeType" OWNER TO postgres;

--
-- Name: FollowUpCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FollowUpCategory" AS ENUM (
    'RECALL',
    'CHRONIC_CARE',
    'POST_OP',
    'FOLLOW_UP'
);


ALTER TYPE public."FollowUpCategory" OWNER TO postgres;

--
-- Name: LabRequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LabRequestStatus" AS ENUM (
    'PENDING_PAYMENT',
    'PAID',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
);


ALTER TYPE public."LabRequestStatus" OWNER TO postgres;

--
-- Name: LabTestCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LabTestCategory" AS ENUM (
    'HEMATOLOGY',
    'SEROLOGY',
    'CHEMISTRY',
    'URINALYSIS',
    'MICROBIOLOGY',
    'HORMONAL',
    'COAGULATION',
    'OTHERS'
);


ALTER TYPE public."LabTestCategory" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'INFO',
    'SUCCESS',
    'WARNING',
    'LAB_REQUEST',
    'RADIOLOGY_REQUEST'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: QueueStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QueueStatus" AS ENUM (
    'WAITING',
    'IN_TRIAGE',
    'TRIAGED',
    'EMERGENCY',
    'COMPLETED'
);


ALTER TYPE public."QueueStatus" OWNER TO postgres;

--
-- Name: RadiologyRequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RadiologyRequestStatus" AS ENUM (
    'PENDING_PAYMENT',
    'PAID',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
);


ALTER TYPE public."RadiologyRequestStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'RECEPTION',
    'TRIAGE',
    'SPECIALIST',
    'LABORATORY',
    'RADIOLOGY',
    'BILLING',
    'FINANCIAL'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: ServiceCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceCategory" AS ENUM (
    'LABORATORY',
    'INPATIENT',
    'CONSULTATION',
    'PROCEDURE',
    'PHARMACY',
    'RADIOLOGY',
    'AMBULANCE',
    'OTHER'
);


ALTER TYPE public."ServiceCategory" OWNER TO postgres;

--
-- Name: WardType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WardType" AS ENUM (
    'ICU',
    'GENERAL',
    'PEDIATRICS',
    'MATERNITY',
    'SURGICAL',
    'MEDICAL'
);


ALTER TYPE public."WardType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: admissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admissions (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "admissionDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dischargeDate" timestamp(3) without time zone,
    source public."AdmissionSource" DEFAULT 'OPD'::public."AdmissionSource" NOT NULL,
    "admittingDoctorId" text,
    ward public."WardType" NOT NULL,
    "bedNumber" text NOT NULL,
    status public."AdmissionStatus" DEFAULT 'ACTIVE'::public."AdmissionStatus" NOT NULL,
    "dischargeType" public."DischargeType",
    "dischargeSummary" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.admissions OWNER TO postgres;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "appointmentDate" timestamp(3) without time zone NOT NULL,
    reason text,
    status public."AppointmentStatus" DEFAULT 'SCHEDULED'::public."AppointmentStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "doctorId" text,
    "doctorName" text,
    priority public."AppointmentPriority" DEFAULT 'ROUTINE'::public."AppointmentPriority" NOT NULL,
    type public."AppointmentType" DEFAULT 'FOLLOW_UP'::public."AppointmentType" NOT NULL,
    "followUpCategory" public."FollowUpCategory"
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    details jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: consultations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultations (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "createdById" text,
    vitals jsonb,
    "chiefComplaint" text NOT NULL,
    diagnosis text NOT NULL,
    "clinicalNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "admissionId" text
);


ALTER TABLE public.consultations OWNER TO postgres;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "serviceName" text NOT NULL,
    category public."ServiceCategory" NOT NULL,
    quantity double precision DEFAULT 1 NOT NULL,
    total double precision NOT NULL,
    "isOverride" boolean DEFAULT false NOT NULL,
    "overrideReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "labRequestId" text,
    "radiologyRequestId" text
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "createdById" text,
    "subTotal" double precision DEFAULT 0 NOT NULL,
    "taxRate" double precision DEFAULT 0.15 NOT NULL,
    "taxAmount" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentMethod" text,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "admissionId" text,
    "relatedRequestId" text,
    "relatedRequestType" text
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: lab_request_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_request_tests (
    id text NOT NULL,
    "labRequestId" text NOT NULL,
    "testName" text NOT NULL,
    category public."LabTestCategory" NOT NULL,
    result text,
    unit text,
    "referenceRange" text,
    flag text,
    remarks text,
    "performedAt" timestamp(3) without time zone,
    "performedBy" text,
    "performedById" text,
    "reportedAt" timestamp(3) without time zone
);


ALTER TABLE public.lab_request_tests OWNER TO postgres;

--
-- Name: lab_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_requests (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "requestedById" text,
    "requestedByName" text,
    "clinicalIndication" text,
    "labNotes" text,
    status public."LabRequestStatus" DEFAULT 'PENDING_PAYMENT'::public."LabRequestStatus" NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "completedById" text,
    "completedByName" text
);


ALTER TABLE public.lab_requests OWNER TO postgres;

--
-- Name: lab_result_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_result_notifications (
    id text NOT NULL,
    "labRequestId" text NOT NULL,
    "patientId" text NOT NULL,
    "patientName" text NOT NULL,
    mrn text NOT NULL,
    "completedById" text NOT NULL,
    "completedByName" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" DEFAULT 'LAB_REQUEST'::public."NotificationType" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.lab_result_notifications OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" DEFAULT 'INFO'::public."NotificationType" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "relatedId" text,
    "relatedType" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paymentStatus" text DEFAULT 'PENDING'::text
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: patient_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_histories (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "historyEntries" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "latestDiagnosis" text,
    "latestNotes" text,
    "archivedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.patient_histories OWNER TO postgres;

--
-- Name: patient_sequences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_sequences (
    id text NOT NULL,
    loc text NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    "lastSeq" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.patient_sequences OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id text NOT NULL,
    mrn text NOT NULL,
    "fullName" text NOT NULL,
    age integer NOT NULL,
    "ageUnit" text DEFAULT 'years'::text,
    sex text,
    gender text,
    "dateOfBirth" timestamp(3) without time zone,
    "phoneNumber" text,
    email text,
    address text,
    region text DEFAULT 'Addis Ababa'::text,
    "zoneSubcity" text,
    woreda text,
    "emergencyName" text,
    "emergencyPhone" text,
    "emergencyRel" text,
    "lastDiagnosis" text,
    "lastSummary" text,
    "lastVisitDate" timestamp(3) without time zone,
    "registeredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "prescribedById" text,
    "medicineName" text NOT NULL,
    dosage text,
    frequency text,
    duration text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: price_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_history (
    id text NOT NULL,
    "serviceId" text NOT NULL,
    "oldPrice" double precision NOT NULL,
    "newPrice" double precision NOT NULL,
    "changeReason" text,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.price_history OWNER TO postgres;

--
-- Name: queues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queues (
    id text NOT NULL,
    "patientId" text NOT NULL,
    status public."QueueStatus" DEFAULT 'WAITING'::public."QueueStatus" NOT NULL,
    "position" integer,
    "enteredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.queues OWNER TO postgres;

--
-- Name: radiology_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.radiology_requests (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "requestedById" text,
    "reportedById" text,
    "requestedByName" text,
    "clinicalData" text,
    "xrayType" text,
    ultrasound text[] DEFAULT ARRAY[]::text[],
    "scanType" text,
    status public."RadiologyRequestStatus" DEFAULT 'PENDING_PAYMENT'::public."RadiologyRequestStatus" NOT NULL,
    findings text,
    impression text,
    "radiologistNotes" text,
    "reportedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.radiology_requests OWNER TO postgres;

--
-- Name: service_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_definitions (
    id text NOT NULL,
    name text NOT NULL,
    category public."ServiceCategory" NOT NULL,
    "billingMethod" public."BillingMethod" DEFAULT 'FIXED'::public."BillingMethod" NOT NULL,
    "basePrice" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.service_definitions OWNER TO postgres;

--
-- Name: triages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.triages (
    id text NOT NULL,
    "patientId" text NOT NULL,
    temperature double precision,
    pulse integer,
    "respiratoryRate" integer,
    "bloodPressure" text,
    spo2 integer,
    weight double precision,
    "chiefComplaint" text NOT NULL,
    "triageLevel" text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.triages OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'RECEPTION'::public."Role" NOT NULL,
    specialty text,
    "failedLoginAttempts" integer DEFAULT 0 NOT NULL,
    "lastFailedLogin" timestamp(3) without time zone,
    "currentSessionToken" text,
    "lastLoginAt" timestamp(3) without time zone,
    "lastLoginIP" text,
    "lastLoginUserAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9f4e2b0a-3f99-47b7-86df-b870a14599ea	679e4ab658398923744dc7284310659e14ff7a5c6e5b560cebd01f8231d793b2	2026-04-08 06:18:52.477172+00	20260408061848_add_patient_sequence	\N	\N	2026-04-08 06:18:48.868373+00	1
44840277-ce78-47a6-9ac8-92b104a7809a	37db538f02950c3b18b62ff2f5569625a030f4bde69d3bda65167baf854aff9d	2026-04-08 06:40:56.934332+00	20260408064056_add_inpatient_admission	\N	\N	2026-04-08 06:40:56.349177+00	1
cefd65c1-c579-4fd7-a284-9c1b2d3508c8	ccf1ccb2ddbc90cbd49afdd801c4041ea65af444591fe3586958068b3674098c	2026-04-09 14:49:14.699055+00	20260409144914_add_appointment_improvements	\N	\N	2026-04-09 14:49:14.356547+00	1
\.


--
-- Data for Name: admissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admissions (id, "patientId", "admissionDate", "dischargeDate", source, "admittingDoctorId", ward, "bedNumber", status, "dischargeType", "dischargeSummary", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, "patientId", "appointmentDate", reason, status, notes, "createdAt", "updatedAt", "doctorId", "doctorName", priority, type, "followUpCategory") FROM stdin;
cmnrn2hcr00012g9ctgthxgkt	cmnppcg720001nc9c2q1w20rb	2026-04-17 18:35:00	kjhjk	SCHEDULED	Created from consultation on 4/9/2026. Category: CHRONIC_CARE	2026-04-09 15:35:37.563	2026-04-09 15:35:37.563	\N	DR seyede cardonailty	ROUTINE	FOLLOW_UP	CHRONIC_CARE
cmnsh7va90001uc9c0fbbmy4f	cmnpnsixd00044s9c5vruex7h	2026-04-18 08:44:00	sdsmds	SCHEDULED	Created from consultation on 4/10/2026. Category: FOLLOW_UP	2026-04-10 05:39:37.377	2026-04-10 05:39:37.377	\N	DR seyede cardonailty	ROUTINE	FOLLOW_UP	FOLLOW_UP
cmnshcgo40004uc9czuqazn3a	cmnppcg720001nc9c2q1w20rb	2026-04-18 08:45:00	fvf	SCHEDULED	Created from consultation on 4/10/2026. Category: FOLLOW_UP	2026-04-10 05:43:11.716	2026-04-10 05:43:11.716	\N	DR seyede cardonailty	ROUTINE	FOLLOW_UP	FOLLOW_UP
cmnsity82000auc9cdorpr86v	cmnppcg720001nc9c2q1w20rb	2026-04-17 06:27:00	sdjjkksd	SCHEDULED	Created from consultation on 4/10/2026. Category: FOLLOW_UP	2026-04-10 06:24:47.234	2026-04-10 06:24:47.234	\N	DR seyede cardonailty	ROUTINE	FOLLOW_UP	FOLLOW_UP
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userId", action, "ipAddress", "userAgent", details, "createdAt") FROM stdin;
cmnpns4fc00024s9coixr7wr0	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-08 06:20:01.512
cmnu2udly0000j89cyqeml6gt	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-11 08:32:45.669
cmnx4zzfk0002vs9c4rompmq8	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-13 11:56:24.992
cmnx6bs7o0000rk9c8ppu2ki5	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-13 12:33:35.124
cmnx7yg6t00003w9cawb2kzwz	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-13 13:19:12.245
cmnx83yik00013w9ci2tuiok8	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-13 13:23:29.276
cmnx84sjh00033w9c9l8278p0	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-13 13:24:08.189
cmnx857et00043w9cui6zt8rp	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-13 13:24:27.461
cmnybdq270000i89c488z2q8r	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::ffff:192.168.87.241	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	{"role": "RECEPTION"}	2026-04-14 07:42:49.903
cmnykhx880000uw9cx9kn1t3v	cmnpnrux300014s9cghhb078k	LOGIN_SUCCESS	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	{"role": "RECEPTION"}	2026-04-14 11:58:02.359
\.


--
-- Data for Name: consultations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultations (id, "patientId", "createdById", vitals, "chiefComplaint", diagnosis, "clinicalNotes", "createdAt", "updatedAt", "admissionId") FROM stdin;
cmnrlhd1g0000149c143cwcp7	cmnpnsixd00044s9c5vruex7h	\N	{"spo2": 23, "pulse": 23, "weight": null, "temperature": 23, "bloodPressure": "23"}	kjjkkj	sd	sd	2026-04-09 14:51:12.58	2026-04-09 14:51:12.58	\N
cmnrmq6p700001g9c0zx55kvv	cmnppcg720001nc9c2q1w20rb	\N	{"spo2": 98, "pulse": 77, "weight": null, "temperature": 37, "bloodPressure": "133/33"}	this patient is the	sd	sd	2026-04-09 15:26:03.883	2026-04-09 15:26:03.883	\N
cmnrmr6l800031g9cvbogwyg3	cmnr4psqd0001no9cz2js2t1d	\N	\N	Direct Consultation	sd	sd	2026-04-09 15:26:50.396	2026-04-09 15:26:50.396	\N
cmnrms5r600051g9c4vlgrnkz	cmnr50syj0007no9co7l94uij	\N	\N	Direct Consultation	sd	sd	2026-04-09 15:27:35.97	2026-04-09 15:27:35.97	\N
cmnrmtam900081g9cse8nczof	cmnr4wdp90004no9csybrxoo3	\N	\N	Direct Consultation	sd	sd	2026-04-09 15:28:28.929	2026-04-09 15:28:28.929	\N
cmnrn2haz00002g9cttgl4tmu	cmnppcg720001nc9c2q1w20rb	\N	\N	Direct Consultation	sd	sd	2026-04-09 15:35:37.498	2026-04-09 15:35:37.498	\N
cmnsh51wa00000g9caeclkn28	cmnr5mssd000ano9ckpzhmmpa	\N	\N	Direct Consultation	sd	sd	2026-04-10 05:37:25.978	2026-04-10 05:37:25.978	\N
cmnsh7v780000uc9cf0bsl47o	cmnpnsixd00044s9c5vruex7h	\N	\N	Direct Consultation	sd	sd	2026-04-10 05:39:37.267	2026-04-10 05:39:37.267	\N
cmnshcg2o0003uc9ce7zev3ky	cmnppcg720001nc9c2q1w20rb	\N	\N	Direct Consultation	sd	sd	2026-04-10 05:43:10.944	2026-04-10 05:43:10.944	\N
cmnsity6a0009uc9c9qrefyjv	cmnppcg720001nc9c2q1w20rb	\N	\N	Direct Consultation	hnhn	dshjds	2026-04-10 06:24:47.169	2026-04-10 06:24:47.169	\N
cmnyledl300009c9c7lsiaxno	cmnpnsixd00044s9c5vruex7h	\N	\N	Direct Consultation	djsj	sdjkjjks	2026-04-14 12:23:16.55	2026-04-14 12:23:16.55	\N
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, "invoiceId", "serviceName", category, quantity, total, "isOverride", "overrideReason", "createdAt", "labRequestId", "radiologyRequestId") FROM stdin;
cmnsm10gh0024oo9co5qfnu17	cmnsm10g90023oo9c6990efpo	CBC	LABORATORY	1	150	f	\N	2026-04-10 07:54:15.561	\N	\N
cmnsm10gh0025oo9ca9lfull2	cmnsm10g90023oo9c6990efpo	WIDAL / O&H	LABORATORY	1	150	f	\N	2026-04-10 07:54:15.561	\N	\N
cmnsm10gh0026oo9cw9iy3jtg	cmnsm10g90023oo9c6990efpo	HBsAg	LABORATORY	1	150	f	\N	2026-04-10 07:54:15.561	\N	\N
cmnsm10gh0027oo9c0hfldde4	cmnsm10g90023oo9c6990efpo	LDL	LABORATORY	1	150	f	\N	2026-04-10 07:54:15.561	\N	\N
cmnsm10gh0028oo9ca90qaex1	cmnsm10g90023oo9c6990efpo	Total T4	LABORATORY	1	150	f	\N	2026-04-10 07:54:15.561	\N	\N
cmnsmntxn0013uc9cq8wjx470	cmnsmntx80012uc9c3z7g3ts5	CBC	LABORATORY	1	150	f	\N	2026-04-10 08:12:00.187	\N	\N
cmnsmntxo0014uc9cqzqy4v12	cmnsmntx80012uc9c3z7g3ts5	ESR	LABORATORY	1	150	f	\N	2026-04-10 08:12:00.187	\N	\N
cmnsmntxo0015uc9c71b8o6sp	cmnsmntx80012uc9c3z7g3ts5	RBS	LABORATORY	1	150	f	\N	2026-04-10 08:12:00.187	\N	\N
cmnsmntxo0016uc9cqr3fer2z	cmnsmntx80012uc9c3z7g3ts5	FBS	LABORATORY	1	150	f	\N	2026-04-10 08:12:00.187	\N	\N
cmnsmntxo0017uc9cy6uv1no4	cmnsmntx80012uc9c3z7g3ts5	ALT/SGOT	LABORATORY	1	150	f	\N	2026-04-10 08:12:00.187	\N	\N
cmnsmlitx000kuc9c2u5dg3rp	cmnsmlit9000juc9cmd847igt	WIDAL / O&H	LABORATORY	1	150	f	\N	2026-04-10 08:10:12.477	\N	\N
cmnsmlitx000luc9cqgtmwzno	cmnsmlit9000juc9cmd847igt	HBsAg	LABORATORY	1	150	f	\N	2026-04-10 08:10:12.477	\N	\N
cmnsmlitx000muc9c7l7ms67p	cmnsmlit9000juc9cmd847igt	RBS	LABORATORY	1	150	f	\N	2026-04-10 08:10:12.477	\N	\N
cmnsmlitx000nuc9c7ma6b0hl	cmnsmlit9000juc9cmd847igt	FBS	LABORATORY	1	150	f	\N	2026-04-10 08:10:12.477	\N	\N
cmnx8h2e4000a3w9c3v4vwpnb	cmnx8h2dv00093w9c4h8yg7tk	CBC	LABORATORY	1	150	f	\N	2026-04-13 13:33:40.819	\N	\N
cmnx8h2e4000b3w9czi5p7fjh	cmnx8h2dv00093w9c4h8yg7tk	ESR	LABORATORY	1	150	f	\N	2026-04-13 13:33:40.819	\N	\N
cmnu4v7860009p49cvysik76j	cmnu4v77r0008p49canaugdng	Ultrasound	RADIOLOGY	1	300	f	\N	2026-04-11 09:29:23.271	\N	\N
cmnylo0bd000c9c9coztcmugj	cmnylo0ah000b9c9c7ljt0ibr	Ultrasound	RADIOLOGY	1	300	f	\N	2026-04-14 12:30:45.881	\N	cmnylo09x000a9c9c6yaj5pyb
cmnsmknr20004uc9czqghzvse	cmnsmknqq0003uc9cvsbhd9pv	CBC	LABORATORY	1	150	f	\N	2026-04-10 08:09:32.21	\N	\N
cmnsmknr20005uc9cswfhmw5q	cmnsmknqq0003uc9cvsbhd9pv	WIDAL / O&H	LABORATORY	1	150	f	\N	2026-04-10 08:09:32.21	\N	\N
cmnsm0dtb001uoo9cnjrps4yr	cmnsm0dt3001too9cv2qbrb5l	ESR	LABORATORY	1	150	f	\N	2026-04-10 07:53:46.215	\N	\N
cmnsm0dtb001voo9c9j0h1fxo	cmnsm0dt3001too9cv2qbrb5l	Blood group & RH	LABORATORY	1	150	f	\N	2026-04-10 07:53:46.215	\N	\N
cmnsmlblf000buc9cfm0cnk3w	cmnsmlbl2000auc9ca4osl31h	RBS	LABORATORY	1	150	f	\N	2026-04-10 08:10:03.11	\N	\N
cmnsmlblf000cuc9ch320y09h	cmnsmlbl2000auc9ca4osl31h	FBS	LABORATORY	1	150	f	\N	2026-04-10 08:10:03.11	\N	\N
cmnu4rc5z0004p49c2462btr2	cmnu4rc4g0003p49cmsfaf5d4	CBC	LABORATORY	1	150	f	\N	2026-04-11 09:26:23.008	\N	\N
cmnu4rc5z0005p49colat2l0n	cmnu4rc4g0003p49cmsfaf5d4	RF	LABORATORY	1	150	f	\N	2026-04-11 09:26:23.008	\N	\N
cmnsmnp2h000tuc9c5ta3xmoa	cmnsmnp2b000suc9c3yvdedea	CBC	LABORATORY	1	150	f	\N	2026-04-10 08:11:53.891	\N	\N
cmnsmnp2h000uuc9cr645jmp5	cmnsmnp2b000suc9c3yvdedea	ESR	LABORATORY	1	150	f	\N	2026-04-10 08:11:53.891	\N	\N
cmnviza9u0005dw9c6521uxdp	cmnviza9e0004dw9ceb0g6gvy	CBC	LABORATORY	1	150	f	\N	2026-04-12 08:52:14.642	\N	\N
cmnviza9u0006dw9ca2nfgo03	cmnviza9e0004dw9ceb0g6gvy	ESR	LABORATORY	1	150	f	\N	2026-04-12 08:52:14.642	\N	\N
cmnviza9u0007dw9csjf8ejz5	cmnviza9e0004dw9ceb0g6gvy	Blood group & RH	LABORATORY	1	150	f	\N	2026-04-12 08:52:14.642	\N	\N
cmnx59k0c0009vs9c9d005unx	cmnx59k000008vs9clwu8kxop	CBC	LABORATORY	1	150	f	\N	2026-04-13 12:03:51.552	\N	\N
cmnx59k0c000avs9cbxywxl29	cmnx59k000008vs9clwu8kxop	ESR	LABORATORY	1	150	f	\N	2026-04-13 12:03:51.552	\N	\N
cmnx59k0d000bvs9c1wo3mgdz	cmnx59k000008vs9clwu8kxop	Blood group & RH	LABORATORY	1	150	f	\N	2026-04-13 12:03:51.552	\N	\N
cmnx59k0d000cvs9c1t3tbjyb	cmnx59k000008vs9clwu8kxop	Peripheral morphology	LABORATORY	1	150	f	\N	2026-04-13 12:03:51.552	\N	\N
cmnx8honm000j3w9cws9fo4mx	cmnx8honf000i3w9c6gdjeyly	ESR	LABORATORY	1	150	f	\N	2026-04-13 13:34:09.674	\N	\N
cmnx8honm000k3w9cm0wtzudd	cmnx8honf000i3w9c6gdjeyly	Blood group & RH	LABORATORY	1	150	f	\N	2026-04-13 13:34:09.674	\N	\N
cmnx8honm000l3w9cfe1x8upm	cmnx8honf000i3w9c6gdjeyly	HCG (PT)	LABORATORY	1	150	f	\N	2026-04-13 13:34:09.674	\N	\N
cmnx8honm000m3w9c64diur42	cmnx8honf000i3w9c6gdjeyly	WIDAL / O&H	LABORATORY	1	150	f	\N	2026-04-13 13:34:09.674	\N	\N
cmnybe0d30005i89c4k6sf38b	cmnybe0cl0004i89c7k290wo3	CBC	LABORATORY	1	150	f	\N	2026-04-14 07:43:03.236	\N	\N
cmnybe0d30006i89ci0y5yl6k	cmnybe0cl0004i89c7k290wo3	ESR	LABORATORY	1	150	f	\N	2026-04-14 07:43:03.236	\N	\N
cmnylnryd00069c9cks7oyocd	cmnylnry400059c9c7xqt6f8c	CBC	LABORATORY	1	150	f	\N	2026-04-14 12:30:35.068	cmnylnrw100019c9c0i9stlec	\N
cmnylnryd00079c9cc1wm151u	cmnylnry400059c9c7xqt6f8c	HCV Ab	LABORATORY	1	150	f	\N	2026-04-14 12:30:35.068	cmnylnrw100019c9c0i9stlec	\N
cmnylnryd00089c9comhmcr61	cmnylnry400059c9c7xqt6f8c	AFB	LABORATORY	1	150	f	\N	2026-04-14 12:30:35.068	cmnylnrw100019c9c0i9stlec	\N
cmnylufcz000i9c9ciro5f8zj	cmnylufcm000h9c9ciokzfp3u	CBC	LABORATORY	1	150	f	\N	2026-04-14 12:35:45.334	cmnylufb6000d9c9cw2vtzjsk	\N
cmnylufd0000j9c9cxhnppaxn	cmnylufcm000h9c9ciokzfp3u	ESR	LABORATORY	1	150	f	\N	2026-04-14 12:35:45.334	cmnylufb6000d9c9cw2vtzjsk	\N
cmnylufd0000k9c9cxyih0ity	cmnylufcm000h9c9ciokzfp3u	Blood group & RH	LABORATORY	1	150	f	\N	2026-04-14 12:35:45.334	cmnylufb6000d9c9cw2vtzjsk	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, "patientId", "createdById", "subTotal", "taxRate", "taxAmount", "totalAmount", status, "paymentMethod", "paidAt", "createdAt", "updatedAt", "admissionId", "relatedRequestId", "relatedRequestType") FROM stdin;
cmnsmlbl2000auc9ca4osl31h	cmnpnsixd00044s9c5vruex7h	\N	300	0.15	45	345	PENDING	\N	\N	2026-04-10 08:10:03.11	2026-04-10 08:10:03.11	\N	cmnsmlbjs0007uc9colnc2k2u	LAB_REQUEST
cmnsmlit9000juc9cmd847igt	cmnpnsixd00044s9c5vruex7h	\N	600	0.15	90	690	PAID	\N	2026-04-10 08:11:09.093	2026-04-10 08:10:12.477	2026-04-10 08:11:09.105	\N	cmnsmlirl000euc9cdoh2l54c	LAB_REQUEST
cmnsmntx80012uc9c3z7g3ts5	cmnpnsixd00044s9c5vruex7h	\N	750	0.15	112.5	862.5	PAID	\N	2026-04-10 08:12:24.698	2026-04-10 08:12:00.187	2026-04-10 08:12:24.699	\N	cmnsmnttm000wuc9cuz8rda68	LAB_REQUEST
cmnsmnp2b000suc9c3yvdedea	cmnpnsixd00044s9c5vruex7h	\N	300	0.15	45	345	PAID	\N	2026-04-10 08:25:38.933	2026-04-10 08:11:53.891	2026-04-10 08:25:38.935	\N	cmnsmnp18000puc9cx9koxja7	LAB_REQUEST
cmnu4v77r0008p49canaugdng	cmnpnsixd00044s9c5vruex7h	\N	300	0.15	45	345	PENDING	\N	\N	2026-04-11 09:29:23.271	2026-04-11 09:29:23.271	\N	cmnu4v76z0007p49c7c198ls9	RADIOLOGY_REQUEST
cmnviza9e0004dw9ceb0g6gvy	cmnpnsixd00044s9c5vruex7h	\N	450	0.15	67.5	517.5	PAID	\N	2026-04-12 08:52:45.404	2026-04-12 08:52:14.642	2026-04-12 08:52:45.408	\N	cmnviza6m0000dw9clb0abubz	LAB_REQUEST
cmnx59k000008vs9clwu8kxop	cmnpnsixd00044s9c5vruex7h	\N	600	0.15	90	690	PAID	\N	2026-04-13 12:04:23.711	2026-04-13 12:03:51.552	2026-04-13 12:04:23.714	\N	cmnx59jyd0003vs9c8jwls2m8	LAB_REQUEST
cmnu4rc4g0003p49cmsfaf5d4	cmnpnsixd00044s9c5vruex7h	\N	300	0.15	45	345	PAID	\N	2026-04-13 12:04:54.722	2026-04-11 09:26:23.008	2026-04-13 12:04:54.724	\N	cmnu4rbxc0000p49cmse2s7ax	LAB_REQUEST
cmnx8honf000i3w9c6gdjeyly	cmnpnsixd00044s9c5vruex7h	\N	600	0.15	90	690	PAID	\N	2026-04-13 13:34:22.073	2026-04-13 13:34:09.674	2026-04-13 13:34:22.078	\N	cmnx8holt000d3w9ci7sbj6h5	LAB_REQUEST
cmnsm0dt3001too9cv2qbrb5l	cmnpnsixd00044s9c5vruex7h	\N	300	0.15	45	345	PENDING	\N	\N	2026-04-10 07:53:46.215	2026-04-10 07:53:46.215	\N	\N	\N
cmnsm10g90023oo9c6990efpo	cmnpnsixd00044s9c5vruex7h	\N	750	0.15	112.5	862.5	PENDING	\N	\N	2026-04-10 07:54:15.561	2026-04-10 07:54:15.561	\N	\N	\N
cmnsmknqq0003uc9cvsbhd9pv	cmnpnsixd00044s9c5vruex7h	\N	300	0.15	45	345	PENDING	\N	\N	2026-04-10 08:09:32.21	2026-04-10 08:09:32.21	\N	cmnsmknov0000uc9cpqruo8b8	LAB_REQUEST
cmnx8h2dv00093w9c4h8yg7tk	cmnpnsixd00044s9c5vruex7h	\N	300	0.15	45	345	PAID	\N	2026-04-13 13:34:24.655	2026-04-13 13:33:40.819	2026-04-13 13:34:24.657	\N	cmnx8h2cb00063w9cxqpki8bs	LAB_REQUEST
cmnybe0cl0004i89c7k290wo3	cmnpnsixd00044s9c5vruex7h	\N	300	0.15	45	345	PENDING	\N	\N	2026-04-14 07:43:03.236	2026-04-14 07:43:03.236	\N	cmnybe0ao0001i89cftpdcgvh	LAB_REQUEST
cmnylnry400059c9c7xqt6f8c	cmnr5mssd000ano9ckpzhmmpa	\N	450	0.15	67.5	517.5	PENDING	\N	\N	2026-04-14 12:30:35.068	2026-04-14 12:30:35.068	\N	cmnylnrw100019c9c0i9stlec	LAB_REQUEST
cmnylo0ah000b9c9c7ljt0ibr	cmnr5mssd000ano9ckpzhmmpa	\N	300	0.15	45	345	PENDING	\N	\N	2026-04-14 12:30:45.881	2026-04-14 12:30:45.881	\N	cmnylo09x000a9c9c6yaj5pyb	RADIOLOGY_REQUEST
cmnylufcm000h9c9ciokzfp3u	cmnr5mssd000ano9ckpzhmmpa	\N	450	0.15	67.5	517.5	PENDING	\N	\N	2026-04-14 12:35:45.334	2026-04-14 12:35:45.334	\N	cmnylufb6000d9c9cw2vtzjsk	LAB_REQUEST
\.


--
-- Data for Name: lab_request_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_request_tests (id, "labRequestId", "testName", category, result, unit, "referenceRange", flag, remarks, "performedAt", "performedBy", "performedById", "reportedAt") FROM stdin;
cmnylnrwc00029c9cnc9z2vd6	cmnylnrw100019c9c0i9stlec	CBC	HEMATOLOGY	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmnylnrwc00039c9cu6d3kt97	cmnylnrw100019c9c0i9stlec	HCV Ab	SEROLOGY	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmnylnrwc00049c9c58fnwhyy	cmnylnrw100019c9c0i9stlec	AFB	MICROBIOLOGY	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmnylufbf000e9c9crkpx25cb	cmnylufb6000d9c9cw2vtzjsk	CBC	HEMATOLOGY	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmnylufbf000f9c9cluv2d2gs	cmnylufb6000d9c9cw2vtzjsk	ESR	HEMATOLOGY	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmnylufbf000g9c9cawcqidqb	cmnylufb6000d9c9cw2vtzjsk	Blood group & RH	HEMATOLOGY	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: lab_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_requests (id, "patientId", "requestedById", "requestedByName", "clinicalIndication", "labNotes", status, "totalAmount", "createdAt", "updatedAt", "completedAt", "completedById", "completedByName") FROM stdin;
cmnylnrw100019c9c0i9stlec	cmnr5mssd000ano9ckpzhmmpa	\N	DR seyede cardonailty	hhjh	hhh	PENDING_PAYMENT	0	2026-04-14 12:30:34.992	2026-04-14 12:30:34.992	\N	\N	\N
cmnylufb6000d9c9cw2vtzjsk	cmnr5mssd000ano9ckpzhmmpa	\N	DR seyede cardonailty	df	\N	PENDING_PAYMENT	0	2026-04-14 12:35:45.282	2026-04-14 12:35:45.282	\N	\N	\N
\.


--
-- Data for Name: lab_result_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_result_notifications (id, "labRequestId", "patientId", "patientName", mrn, "completedById", "completedByName", title, message, type, "isRead", "readAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", title, message, type, "isRead", "relatedId", "relatedType", "createdAt", "paymentStatus") FROM stdin;
\.


--
-- Data for Name: patient_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_histories (id, "patientId", "historyEntries", "latestDiagnosis", "latestNotes", "archivedAt") FROM stdin;
cmnrmr6lt00041g9c45vgy08s	cmnr4psqd0001no9cz2js2t1d	[{"triage": null, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [], "sessionDate": "2026-04-09T15:26:50.409Z", "clinicalNotes": "sd", "chiefComplaint": "Direct Consultation", "consultationId": "cmnrmr6l800031g9cvbogwyg3", "radiologyRequests": []}]	sd	sd	2026-04-09 15:26:50.417
cmnrms5rr00061g9c79t9vrdr	cmnr50syj0007no9co7l94uij	[{"triage": null, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [], "sessionDate": "2026-04-09T15:27:35.981Z", "clinicalNotes": "sd", "chiefComplaint": "Direct Consultation", "consultationId": "cmnrms5r600051g9c4vlgrnkz", "radiologyRequests": []}]	sd	sd	2026-04-09 15:27:35.991
cmnrmtamt00091g9cb447xzpy	cmnr4wdp90004no9csybrxoo3	[{"triage": null, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [], "sessionDate": "2026-04-09T15:28:28.939Z", "clinicalNotes": "sd", "chiefComplaint": "Direct Consultation", "consultationId": "cmnrmtam900081g9cse8nczof", "radiologyRequests": []}]	sd	sd	2026-04-09 15:28:28.949
cmnrmq6qi00011g9c4wknvmd2	cmnppcg720001nc9c2q1w20rb	[{"triage": null, "diagnosis": "hnhn", "doctorName": "DR seyede cardonailty", "labRequests": [], "sessionDate": "2026-04-10T06:24:47.188Z", "clinicalNotes": "dshjds", "chiefComplaint": "Direct Consultation", "consultationId": "cmnsity6a0009uc9c9qrefyjv", "radiologyRequests": []}, {"triage": null, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [], "sessionDate": "2026-04-10T05:43:11.047Z", "clinicalNotes": "sd", "chiefComplaint": "Direct Consultation", "consultationId": "cmnshcg2o0003uc9ce7zev3ky", "radiologyRequests": []}, {"triage": null, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [], "sessionDate": "2026-04-09T15:35:37.509Z", "clinicalNotes": "sd", "chiefComplaint": "Direct Consultation", "consultationId": "cmnrn2haz00002g9cttgl4tmu", "radiologyRequests": []}, {"triage": {"id": "cmnq0iocv0001lo9ce219uikb", "spo2": 98, "notes": "", "pulse": 77, "weight": null, "createdAt": "2026-04-08T12:16:35.791Z", "patientId": "cmnppcg720001nc9c2q1w20rb", "updatedAt": "2026-04-08T12:16:35.791Z", "temperature": 37, "triageLevel": "1", "bloodPressure": "133/33", "chiefComplaint": "this patient is the", "respiratoryRate": null}, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [{"id": "cmnq0lv430002lo9chejpgy3z", "tests": [{"id": "cmnq0lv4d0003lo9c50i98a8r", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "CBC", "performedAt": null, "performedBy": null, "labRequestId": "cmnq0lv430002lo9chejpgy3z", "referenceRange": null}, {"id": "cmnq0lv4d0004lo9cggtfbfsd", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "HBsAg", "performedAt": null, "performedBy": null, "labRequestId": "cmnq0lv430002lo9chejpgy3z", "referenceRange": null}], "status": "PAID", "labNotes": "tttttttttttttttttttttttttt", "createdAt": "2026-04-08T12:19:04.515Z", "patientId": "cmnppcg720001nc9c2q1w20rb", "updatedAt": "2026-04-09T05:31:04.135Z", "totalAmount": 0, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "requestedByName": "DR seyede cardonailty", "clinicalIndication": "yyyyyyyyyyyyyyyyyyy"}], "sessionDate": "2026-04-09T15:26:03.905Z", "clinicalNotes": "sd", "chiefComplaint": "this patient is the", "consultationId": "cmnrmq6p700001g9c0zx55kvv", "radiologyRequests": [{"id": "cmnq0mmly000elo9c32gmr94u", "status": "PAID", "findings": null, "scanType": "Ultrasound", "xrayType": null, "createdAt": "2026-04-08T12:19:40.150Z", "patientId": "cmnppcg720001nc9c2q1w20rb", "updatedAt": "2026-04-09T05:30:59.747Z", "impression": null, "reportedAt": null, "ultrasound": ["Abdominal"], "clinicalData": "test one", "reportedById": null, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "requestedByName": "DR seyede cardonailty", "radiologistNotes": null}, {"id": "cmnq0mls4000blo9ct0565dat", "status": "PAID", "findings": null, "scanType": "Ultrasound", "xrayType": null, "createdAt": "2026-04-08T12:19:39.076Z", "patientId": "cmnppcg720001nc9c2q1w20rb", "updatedAt": "2026-04-09T07:40:11.046Z", "impression": null, "reportedAt": null, "ultrasound": ["Abdominal"], "clinicalData": "test one", "reportedById": null, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "requestedByName": "DR seyede cardonailty", "radiologistNotes": null}, {"id": "cmnq0mih00008lo9czhldlq55", "status": "PAID", "findings": null, "scanType": "Ultrasound", "xrayType": null, "createdAt": "2026-04-08T12:19:34.788Z", "patientId": "cmnppcg720001nc9c2q1w20rb", "updatedAt": "2026-04-09T07:45:51.050Z", "impression": null, "reportedAt": null, "ultrasound": ["Abdominal"], "clinicalData": "test one", "reportedById": null, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "requestedByName": "DR seyede cardonailty", "radiologistNotes": null}]}]	hnhn	dshjds	2026-04-10 06:24:47.198
cmnrlhd230001149cklvw0x9r	cmnpnsixd00044s9c5vruex7h	[{"triage": null, "diagnosis": "djsj", "doctorName": "DR seyede cardonailty", "labRequests": [{"id": "cmnybe0ao0001i89cftpdcgvh", "tests": [{"id": "cmnybe0aw0002i89crxwtftn3", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "CBC", "reportedAt": null, "performedAt": null, "performedBy": null, "labRequestId": "cmnybe0ao0001i89cftpdcgvh", "performedById": null, "referenceRange": null}, {"id": "cmnybe0aw0003i89cnjy43est", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "ESR", "reportedAt": null, "performedAt": null, "performedBy": null, "labRequestId": "cmnybe0ao0001i89cftpdcgvh", "performedById": null, "referenceRange": null}], "status": "PENDING_PAYMENT", "labNotes": null, "createdAt": "2026-04-14T07:43:03.168Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-14T07:43:03.168Z", "completedAt": null, "totalAmount": 0, "completedById": null, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "completedByName": null, "requestedByName": "DR seyede cardonailty", "clinicalIndication": "hgh"}, {"id": "cmnx8holt000d3w9ci7sbj6h5", "tests": [{"id": "cmnx8hom2000g3w9coct1q7za", "flag": null, "unit": null, "result": "dkjj", "remarks": null, "category": "SEROLOGY", "testName": "HCG (PT)", "reportedAt": "2026-04-13T13:35:29.654Z", "performedAt": "2026-04-13T13:35:29.654Z", "performedBy": "kikis", "labRequestId": "cmnx8holt000d3w9ci7sbj6h5", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}, {"id": "cmnx8hom2000h3w9cx6dw69e7", "flag": null, "unit": null, "result": "jh", "remarks": null, "category": "SEROLOGY", "testName": "WIDAL / O&H", "reportedAt": "2026-04-13T13:35:29.654Z", "performedAt": "2026-04-13T13:35:29.654Z", "performedBy": "kikis", "labRequestId": "cmnx8holt000d3w9ci7sbj6h5", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}, {"id": "cmnx8hom1000e3w9c79u3m7ns", "flag": null, "unit": "×10⁶/µL", "result": "bb", "remarks": null, "category": "HEMATOLOGY", "testName": "ESR", "reportedAt": "2026-04-13T13:35:29.654Z", "performedAt": "2026-04-13T13:35:29.654Z", "performedBy": "kikis", "labRequestId": "cmnx8holt000d3w9ci7sbj6h5", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}, {"id": "cmnx8hom1000f3w9cids33nct", "flag": null, "unit": null, "result": "hh", "remarks": null, "category": "HEMATOLOGY", "testName": "Blood group & RH", "reportedAt": "2026-04-13T13:35:29.654Z", "performedAt": "2026-04-13T13:35:29.654Z", "performedBy": "kikis", "labRequestId": "cmnx8holt000d3w9ci7sbj6h5", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}], "status": "COMPLETED", "labNotes": null, "createdAt": "2026-04-13T13:34:09.617Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-13T13:35:29.721Z", "completedAt": "2026-04-13T13:35:29.654Z", "totalAmount": 0, "completedById": "cmnpwubls0000509cgoprsjfy", "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "completedByName": "kikis", "requestedByName": "DR seyede cardonailty", "clinicalIndication": "hhh"}, {"id": "cmnx8h2cb00063w9cxqpki8bs", "tests": [{"id": "cmnx8h2cj00073w9chmnuivoz", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "CBC", "reportedAt": null, "performedAt": null, "performedBy": null, "labRequestId": "cmnx8h2cb00063w9cxqpki8bs", "performedById": null, "referenceRange": null}, {"id": "cmnx8h2cj00083w9c5ypm97fq", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "ESR", "reportedAt": null, "performedAt": null, "performedBy": null, "labRequestId": "cmnx8h2cb00063w9cxqpki8bs", "performedById": null, "referenceRange": null}], "status": "PAID", "labNotes": "xc", "createdAt": "2026-04-13T13:33:40.763Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-13T13:34:24.718Z", "completedAt": null, "totalAmount": 0, "completedById": null, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "completedByName": null, "requestedByName": "DR seyede cardonailty", "clinicalIndication": "xc"}, {"id": "cmnx59jyd0003vs9c8jwls2m8", "tests": [{"id": "cmnx59jyk0004vs9cma26x1d5", "flag": null, "unit": "×10³/µL", "result": "rt", "remarks": "rt", "category": "HEMATOLOGY", "testName": "CBC", "reportedAt": "2026-04-13T12:09:05.214Z", "performedAt": "2026-04-13T12:09:05.214Z", "performedBy": "kikis", "labRequestId": "cmnx59jyd0003vs9c8jwls2m8", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}, {"id": "cmnx59jyk0005vs9ck6vdk7zg", "flag": null, "unit": "×10⁶/µL", "result": "rt", "remarks": "rt", "category": "HEMATOLOGY", "testName": "ESR", "reportedAt": "2026-04-13T12:09:05.214Z", "performedAt": "2026-04-13T12:09:05.214Z", "performedBy": "kikis", "labRequestId": "cmnx59jyd0003vs9c8jwls2m8", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}, {"id": "cmnx59jyk0006vs9cw4ke68z1", "flag": null, "unit": "10^12/L", "result": "rt", "remarks": "rtrt", "category": "HEMATOLOGY", "testName": "Blood group & RH", "reportedAt": "2026-04-13T12:09:05.214Z", "performedAt": "2026-04-13T12:09:05.214Z", "performedBy": "kikis", "labRequestId": "cmnx59jyd0003vs9c8jwls2m8", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}, {"id": "cmnx59jyk0007vs9cd5en4y93", "flag": null, "unit": "×10³/µL", "result": "rt", "remarks": "tr", "category": "HEMATOLOGY", "testName": "Peripheral morphology", "reportedAt": "2026-04-13T12:09:05.214Z", "performedAt": "2026-04-13T12:09:05.214Z", "performedBy": "kikis", "labRequestId": "cmnx59jyd0003vs9c8jwls2m8", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}], "status": "COMPLETED", "labNotes": "sjd", "createdAt": "2026-04-13T12:03:51.493Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-13T12:09:05.464Z", "completedAt": "2026-04-13T12:09:05.214Z", "totalAmount": 0, "completedById": "cmnpwubls0000509cgoprsjfy", "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "completedByName": "kikis", "requestedByName": "DR seyede cardonailty", "clinicalIndication": "sjkjdjs"}, {"id": "cmnviza6m0000dw9clb0abubz", "tests": [{"id": "cmnviza6z0001dw9c3ruht0h7", "flag": null, "unit": "×10⁶/µL", "result": "232", "remarks": "jkjkfjd", "category": "HEMATOLOGY", "testName": "CBC", "reportedAt": "2026-04-13T12:02:13.381Z", "performedAt": "2026-04-13T12:02:13.381Z", "performedBy": "kikis", "labRequestId": "cmnviza6m0000dw9clb0abubz", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}, {"id": "cmnviza6z0002dw9crsyxhhy0", "flag": null, "unit": "fL", "result": "xhjhjkj", "remarks": "lkdjkjfd", "category": "HEMATOLOGY", "testName": "ESR", "reportedAt": "2026-04-13T12:02:13.381Z", "performedAt": "2026-04-13T12:02:13.381Z", "performedBy": "kikis", "labRequestId": "cmnviza6m0000dw9clb0abubz", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}, {"id": "cmnviza6z0003dw9cc9b0giwb", "flag": null, "unit": "10^9/L", "result": "rkjkjk", "remarks": "jkdkjfjk", "category": "HEMATOLOGY", "testName": "Blood group & RH", "reportedAt": "2026-04-13T12:02:13.381Z", "performedAt": "2026-04-13T12:02:13.381Z", "performedBy": "kikis", "labRequestId": "cmnviza6m0000dw9clb0abubz", "performedById": "cmnpwubls0000509cgoprsjfy", "referenceRange": null}], "status": "COMPLETED", "labNotes": null, "createdAt": "2026-04-12T08:52:14.541Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-13T12:02:13.422Z", "completedAt": "2026-04-13T12:02:13.422Z", "totalAmount": 0, "completedById": "cmnpwubls0000509cgoprsjfy", "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "completedByName": "kikis", "requestedByName": "DR seyede cardonailty", "clinicalIndication": "mish  dhshjds  dshjghdshd hjsdhjs"}], "sessionDate": "2026-04-14T12:23:16.576Z", "clinicalNotes": "sdjkjjks", "chiefComplaint": "Direct Consultation", "consultationId": "cmnyledl300009c9c7lsiaxno", "radiologyRequests": [{"id": "cmnu4v76z0007p49c7c198ls9", "status": "PENDING_PAYMENT", "findings": null, "scanType": "Ultrasound", "xrayType": null, "createdAt": "2026-04-11T09:29:23.243Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-11T09:29:23.243Z", "impression": null, "reportedAt": null, "ultrasound": ["Abdominal", "Pelvic"], "clinicalData": "f", "reportedById": null, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "requestedByName": "DR seyede cardonailty", "radiologistNotes": null}]}, {"triage": null, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [], "sessionDate": "2026-04-10T05:39:37.282Z", "clinicalNotes": "sd", "chiefComplaint": "Direct Consultation", "consultationId": "cmnsh7v780000uc9cf0bsl47o", "radiologyRequests": []}, {"triage": {"id": "cmnpo039a00094s9chqcec4s8", "spo2": 23, "notes": "", "pulse": 23, "weight": null, "createdAt": "2026-04-08T06:26:13.246Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-08T06:26:13.246Z", "temperature": 23, "triageLevel": "4", "bloodPressure": "23", "chiefComplaint": "kjjkkj", "respiratoryRate": null}, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [{"id": "cmnr6c829000cno9cani0yyaq", "tests": [{"id": "cmnr6c82j000dno9cc4xjvbay", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "CBC", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000eno9c19va1tcl", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "ESR", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000fno9c3ahvw0eh", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "Blood group & RH", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000gno9c2ufg0ilt", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "Peripheral morphology", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000hno9c690z8q98", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "Blood film", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000ino9cmer474xr", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "HCG (PT)", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000jno9cllkve7yv", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "WIDAL / O&H", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000kno9cxy7nzq8f", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "HBsAg", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000lno9ck6plfaos", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "HCV Ab", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000mno9c8515dwya", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "RF", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}, {"id": "cmnr6c82j000nno9cwykv8237", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "ANA", "performedAt": null, "performedBy": null, "labRequestId": "cmnr6c829000cno9cani0yyaq", "referenceRange": null}], "status": "PAID", "labNotes": null, "createdAt": "2026-04-09T07:47:18.609Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-09T07:47:58.016Z", "totalAmount": 0, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "requestedByName": "DR seyede cardonailty", "clinicalIndication": "sd"}, {"id": "cmnpx1ru70008509cplugxdif", "tests": [{"id": "cmnpx1rue0009509ci9cne828", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "CBC", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1rue000a509cc57i9jhi", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "ESR", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1rue000b509c4ag6a2uh", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "WIDAL / O&H", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1ruf000c509ch73adm2z", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "HBsAg", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1ruf000d509cxxl2b4jt", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "HCV Ab", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1ruf000e509c1o85g1ro", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "RF", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1ruf000f509cn4gia576", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "ANA", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1ruf000g509c21ysjfrq", "flag": null, "unit": null, "result": null, "remarks": null, "category": "CHEMISTRY", "testName": "RBS", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1ruf000h509c2v74m69v", "flag": null, "unit": null, "result": null, "remarks": null, "category": "CHEMISTRY", "testName": "FBS", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1ruf000i509csn4cfhrq", "flag": null, "unit": null, "result": null, "remarks": null, "category": "OTHERS", "testName": "Urinalysis (Physical + Chemical + Micro)", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}, {"id": "cmnpx1ruf000j509cb2l65m1f", "flag": null, "unit": null, "result": null, "remarks": null, "category": "URINALYSIS", "testName": "Urine Pregnancy Test", "performedAt": null, "performedBy": null, "labRequestId": "cmnpx1ru70008509cplugxdif", "referenceRange": null}], "status": "PAID", "labNotes": null, "createdAt": "2026-04-08T10:39:28.302Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-08T10:39:57.569Z", "totalAmount": 0, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "requestedByName": "DR seyede cardonailty", "clinicalIndication": "dd"}, {"id": "cmnpwvwnj0002509ccr90hw9e", "tests": [{"id": "cmnpwvwnv0003509cznphfs5a", "flag": null, "unit": null, "result": null, "remarks": null, "category": "HEMATOLOGY", "testName": "CBC", "performedAt": null, "performedBy": null, "labRequestId": "cmnpwvwnj0002509ccr90hw9e", "referenceRange": null}, {"id": "cmnpwvwnv0004509c57vubzx7", "flag": null, "unit": null, "result": null, "remarks": null, "category": "SEROLOGY", "testName": "HBsAg", "performedAt": null, "performedBy": null, "labRequestId": "cmnpwvwnj0002509ccr90hw9e", "referenceRange": null}], "status": "PAID", "labNotes": null, "createdAt": "2026-04-08T10:34:54.606Z", "patientId": "cmnpnsixd00044s9c5vruex7h", "updatedAt": "2026-04-08T10:39:57.588Z", "totalAmount": 0, "requestedById": "cmnpnyysu00074s9ce4ibxtyk", "requestedByName": "DR seyede cardonailty", "clinicalIndication": "jdhjfjdjf"}], "sessionDate": "2026-04-09T14:51:12.589Z", "clinicalNotes": "sd", "chiefComplaint": "kjjkkj", "consultationId": "cmnrlhd1g0000149c143cwcp7", "radiologyRequests": []}]	djsj	sdjkjjks	2026-04-14 12:23:16.599
cmnsh51xm00010g9c9w27hwsp	cmnr5mssd000ano9ckpzhmmpa	[{"triage": null, "diagnosis": "sd", "doctorName": "DR seyede cardonailty", "labRequests": [], "sessionDate": "2026-04-10T05:37:26.010Z", "clinicalNotes": "sd", "chiefComplaint": "Direct Consultation", "consultationId": "cmnsh51wa00000g9caeclkn28", "radiologyRequests": []}]	sd	sd	2026-04-10 05:37:26.026
\.


--
-- Data for Name: patient_sequences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_sequences (id, loc, year, month, "lastSeq") FROM stdin;
cmnpnsiv700034s9c2zmz5x0w	AA	2026	4	1
cmnppcg4u0000nc9c36puo6cm	WD	2026	4	6
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, mrn, "fullName", age, "ageUnit", sex, gender, "dateOfBirth", "phoneNumber", email, address, region, "zoneSubcity", woreda, "emergencyName", "emergencyPhone", "emergencyRel", "lastDiagnosis", "lastSummary", "lastVisitDate", "registeredAt", "updatedAt") FROM stdin;
cmnppd4gs0004nc9czxkl7lb4	WD-202604-0002	ggghg	4345	years	M	\N	\N	+251887788787	\N	jhjjh	Addis Ababa	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-08 07:04:20.95	2026-04-08 12:14:21.578
cmnr4psqd0001no9cz2js2t1d	WD-202604-0003	ds	32	months	M	\N	\N	+251947734374	\N	mijds	Amhara	\N	\N	\N	\N	\N	sd	sd	2026-04-09 15:26:50.428	2026-04-09 07:01:52.687	2026-04-09 15:26:50.43
cmnr50syj0007no9co7l94uij	WD-202604-0005	kibed	23	years	M	\N	\N	\N	\N	jhhjh	Amhara	\N	\N	\N	\N	\N	sd	sd	2026-04-09 15:27:36.002	2026-04-09 07:10:26.2	2026-04-09 15:27:36.003
cmnr4wdp90004no9csybrxoo3	WD-202604-0004	kik	78	years	M	\N	\N	\N	\N	\N	Amhara	\N	\N	\N	\N	\N	sd	sd	2026-04-09 15:28:28.958	2026-04-09 07:06:59.802	2026-04-09 15:28:28.96
cmnr5mssd000ano9ckpzhmmpa	WD-202604-0006	nmnnn	5666	years	M	\N	\N	+251	\N	welod	Amhara	\N	\N	\N	\N	\N	sd	sd	2026-04-10 05:37:26.035	2026-04-09 07:27:32.411	2026-04-10 05:37:26.048
cmnppcg720001nc9c2q1w20rb	WD-202604-0001	kik	78	years	M	\N	\N	+251989988999	\N	ghvvggv	Addis Ababa	\N	\N	\N	\N	\N	hnhn	dshjds	2026-04-10 06:24:47.214	2026-04-08 07:03:49.495	2026-04-10 06:24:47.219
cmnpnsixd00044s9c5vruex7h	AA-202604-0001	lkkjk	22	years	M	\N	\N	+251977666565	\N	mid	Addis Ababa	\N	\N	\N	\N	\N	djsj	sdjkjjks	2026-04-14 12:23:16.626	2026-04-08 06:20:20.299	2026-04-14 13:04:04.656
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, "patientId", "prescribedById", "medicineName", dosage, frequency, duration, "createdAt") FROM stdin;
\.


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_history (id, "serviceId", "oldPrice", "newPrice", "changeReason", "changedAt") FROM stdin;
\.


--
-- Data for Name: queues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.queues (id, "patientId", status, "position", "enteredAt", "updatedAt") FROM stdin;
cmnppd4h40005nc9cmrwyn201	cmnppd4gs0004nc9czxkl7lb4	IN_TRIAGE	\N	2026-04-08 07:04:20.95	2026-04-08 12:14:21.494
cmnshz3n40007uc9cyuuxmxi3	cmnr5mssd000ano9ckpzhmmpa	TRIAGED	4	2026-04-10 06:00:47.92	2026-04-10 06:00:50.592
cmnsieue20008uc9c07fg0x3m	cmnr50syj0007no9co7l94uij	TRIAGED	5	2026-04-10 06:13:02.425	2026-04-10 06:13:06.181
cmnsiwmqe000buc9cgzkamvhq	cmnr4wdp90004no9csybrxoo3	WAITING	5	2026-04-10 06:26:52.31	2026-04-10 06:26:52.31
cmnymutgf0000jk9ckcfd4214	cmnpnsixd00044s9c5vruex7h	TRIAGED	5	2026-04-14 13:04:03.23	2026-04-14 13:04:30.83
\.


--
-- Data for Name: radiology_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.radiology_requests (id, "patientId", "requestedById", "reportedById", "requestedByName", "clinicalData", "xrayType", ultrasound, "scanType", status, findings, impression, "radiologistNotes", "reportedAt", "createdAt", "updatedAt") FROM stdin;
cmnylo09x000a9c9c6yaj5pyb	cmnr5mssd000ano9ckpzhmmpa	\N	\N	DR seyede cardonailty	hjjh	\N	{Abdominal,Pelvic}	Ultrasound	PENDING_PAYMENT	\N	\N	\N	\N	2026-04-14 12:30:45.861	2026-04-14 12:30:45.861
\.


--
-- Data for Name: service_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_definitions (id, name, category, "billingMethod", "basePrice", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: triages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.triages (id, "patientId", temperature, pulse, "respiratoryRate", "bloodPressure", spo2, weight, "chiefComplaint", "triageLevel", notes, "createdAt", "updatedAt") FROM stdin;
cmnymvepy0002jk9ch6ls5owu	cmnpnsixd00044s9c5vruex7h	66	6	\N	67/8	78	\N	bvb	4		2026-04-14 13:04:30.79	2026-04-14 13:04:30.79
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, specialty, "failedLoginAttempts", "lastFailedLogin", "currentSessionToken", "lastLoginAt", "lastLoginIP", "lastLoginUserAgent", "createdAt", "updatedAt") FROM stdin;
cmnpnrux300014s9cghhb078k	wew	rec1@gmail.com	$2b$12$4Lo0WCrSn4r9/91wRaoe..vp0Am/iYe.6m8VDjbggutp6NaodL6WC	RECEPTION	\N	0	\N	1cf396de-97e5-4e0d-a027-e83d0e254b1b	2026-04-14 11:57:58.861	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	2026-04-08 06:19:49.191	2026-04-14 11:58:02.09
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admissions admissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lab_request_tests lab_request_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_request_tests
    ADD CONSTRAINT lab_request_tests_pkey PRIMARY KEY (id);


--
-- Name: lab_requests lab_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_requests
    ADD CONSTRAINT lab_requests_pkey PRIMARY KEY (id);


--
-- Name: lab_result_notifications lab_result_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_notifications
    ADD CONSTRAINT lab_result_notifications_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patient_histories patient_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_histories
    ADD CONSTRAINT patient_histories_pkey PRIMARY KEY (id);


--
-- Name: patient_sequences patient_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_sequences
    ADD CONSTRAINT patient_sequences_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: price_history price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_pkey PRIMARY KEY (id);


--
-- Name: queues queues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queues
    ADD CONSTRAINT queues_pkey PRIMARY KEY (id);


--
-- Name: radiology_requests radiology_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radiology_requests
    ADD CONSTRAINT radiology_requests_pkey PRIMARY KEY (id);


--
-- Name: service_definitions service_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_definitions
    ADD CONSTRAINT service_definitions_pkey PRIMARY KEY (id);


--
-- Name: triages triages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.triages
    ADD CONSTRAINT triages_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admissions_bedNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "admissions_bedNumber_idx" ON public.admissions USING btree ("bedNumber");


--
-- Name: admissions_patientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "admissions_patientId_idx" ON public.admissions USING btree ("patientId");


--
-- Name: admissions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admissions_status_idx ON public.admissions USING btree (status);


--
-- Name: admissions_ward_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admissions_ward_idx ON public.admissions USING btree (ward);


--
-- Name: appointments_appointmentDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "appointments_appointmentDate_idx" ON public.appointments USING btree ("appointmentDate");


--
-- Name: appointments_doctorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "appointments_doctorId_idx" ON public.appointments USING btree ("doctorId");


--
-- Name: appointments_followUpCategory_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "appointments_followUpCategory_idx" ON public.appointments USING btree ("followUpCategory");


--
-- Name: appointments_patientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "appointments_patientId_idx" ON public.appointments USING btree ("patientId");


--
-- Name: appointments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX appointments_status_idx ON public.appointments USING btree (status);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: consultations_admissionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "consultations_admissionId_idx" ON public.consultations USING btree ("admissionId");


--
-- Name: consultations_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "consultations_createdById_idx" ON public.consultations USING btree ("createdById");


--
-- Name: consultations_patientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "consultations_patientId_idx" ON public.consultations USING btree ("patientId");


--
-- Name: invoices_patientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_patientId_idx" ON public.invoices USING btree ("patientId");


--
-- Name: invoices_relatedRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoices_relatedRequestId_idx" ON public.invoices USING btree ("relatedRequestId");


--
-- Name: lab_request_tests_labRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_request_tests_labRequestId_idx" ON public.lab_request_tests USING btree ("labRequestId");


--
-- Name: lab_request_tests_performedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_request_tests_performedById_idx" ON public.lab_request_tests USING btree ("performedById");


--
-- Name: lab_requests_completedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_requests_completedById_idx" ON public.lab_requests USING btree ("completedById");


--
-- Name: lab_requests_patientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_requests_patientId_idx" ON public.lab_requests USING btree ("patientId");


--
-- Name: lab_requests_requestedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_requests_requestedById_idx" ON public.lab_requests USING btree ("requestedById");


--
-- Name: lab_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lab_requests_status_idx ON public.lab_requests USING btree (status);


--
-- Name: lab_result_notifications_completedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_result_notifications_completedById_idx" ON public.lab_result_notifications USING btree ("completedById");


--
-- Name: lab_result_notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_result_notifications_createdAt_idx" ON public.lab_result_notifications USING btree ("createdAt");


--
-- Name: lab_result_notifications_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_result_notifications_isRead_idx" ON public.lab_result_notifications USING btree ("isRead");


--
-- Name: lab_result_notifications_labRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_result_notifications_labRequestId_idx" ON public.lab_result_notifications USING btree ("labRequestId");


--
-- Name: lab_result_notifications_patientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "lab_result_notifications_patientId_idx" ON public.lab_result_notifications USING btree ("patientId");


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_isRead_idx" ON public.notifications USING btree ("isRead");


--
-- Name: notifications_relatedId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_relatedId_idx" ON public.notifications USING btree ("relatedId");


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: patient_histories_archivedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "patient_histories_archivedAt_idx" ON public.patient_histories USING btree ("archivedAt");


--
-- Name: patient_histories_patientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "patient_histories_patientId_idx" ON public.patient_histories USING btree ("patientId");


--
-- Name: patient_sequences_loc_year_month_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX patient_sequences_loc_year_month_key ON public.patient_sequences USING btree (loc, year, month);


--
-- Name: patients_fullName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "patients_fullName_idx" ON public.patients USING btree ("fullName");


--
-- Name: patients_lastVisitDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "patients_lastVisitDate_idx" ON public.patients USING btree ("lastVisitDate");


--
-- Name: patients_mrn_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX patients_mrn_idx ON public.patients USING btree (mrn);


--
-- Name: patients_mrn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX patients_mrn_key ON public.patients USING btree (mrn);


--
-- Name: patients_phoneNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "patients_phoneNumber_idx" ON public.patients USING btree ("phoneNumber");


--
-- Name: patients_phoneNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "patients_phoneNumber_key" ON public.patients USING btree ("phoneNumber");


--
-- Name: queues_patientId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "queues_patientId_key" ON public.queues USING btree ("patientId");


--
-- Name: radiology_requests_patientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "radiology_requests_patientId_idx" ON public.radiology_requests USING btree ("patientId");


--
-- Name: radiology_requests_reportedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "radiology_requests_reportedById_idx" ON public.radiology_requests USING btree ("reportedById");


--
-- Name: radiology_requests_requestedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "radiology_requests_requestedById_idx" ON public.radiology_requests USING btree ("requestedById");


--
-- Name: radiology_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX radiology_requests_status_idx ON public.radiology_requests USING btree (status);


--
-- Name: service_definitions_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX service_definitions_name_key ON public.service_definitions USING btree (name);


--
-- Name: triages_patientId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "triages_patientId_key" ON public.triages USING btree ("patientId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: admissions admissions_admittingDoctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT "admissions_admittingDoctorId_fkey" FOREIGN KEY ("admittingDoctorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: admissions admissions_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT "admissions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointments appointments_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consultations consultations_admissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT "consultations_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES public.admissions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: consultations consultations_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT "consultations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: consultations consultations_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_labRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_labRequestId_fkey" FOREIGN KEY ("labRequestId") REFERENCES public.lab_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoice_items invoice_items_radiologyRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_radiologyRequestId_fkey" FOREIGN KEY ("radiologyRequestId") REFERENCES public.radiology_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_admissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES public.admissions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lab_request_tests lab_request_tests_labRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_request_tests
    ADD CONSTRAINT "lab_request_tests_labRequestId_fkey" FOREIGN KEY ("labRequestId") REFERENCES public.lab_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lab_request_tests lab_request_tests_performedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_request_tests
    ADD CONSTRAINT "lab_request_tests_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lab_requests lab_requests_completedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_requests
    ADD CONSTRAINT "lab_requests_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lab_requests lab_requests_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_requests
    ADD CONSTRAINT "lab_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lab_requests lab_requests_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_requests
    ADD CONSTRAINT "lab_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lab_result_notifications lab_result_notifications_completedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_notifications
    ADD CONSTRAINT "lab_result_notifications_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lab_result_notifications lab_result_notifications_labRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_notifications
    ADD CONSTRAINT "lab_result_notifications_labRequestId_fkey" FOREIGN KEY ("labRequestId") REFERENCES public.lab_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lab_result_notifications lab_result_notifications_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_result_notifications
    ADD CONSTRAINT "lab_result_notifications_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patient_histories patient_histories_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_histories
    ADD CONSTRAINT "patient_histories_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_prescribedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT "prescriptions_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: price_history price_history_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT "price_history_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.service_definitions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: queues queues_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queues
    ADD CONSTRAINT "queues_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: radiology_requests radiology_requests_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radiology_requests
    ADD CONSTRAINT "radiology_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: radiology_requests radiology_requests_reportedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radiology_requests
    ADD CONSTRAINT "radiology_requests_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: radiology_requests radiology_requests_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radiology_requests
    ADD CONSTRAINT "radiology_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: triages triages_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.triages
    ADD CONSTRAINT "triages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict nh9yKrASWRIfHfOsNVScUmzm8iiil4Hcdtq5Ep1DLu7G4UIGZ7Sg6hEgRGIQ8qH

