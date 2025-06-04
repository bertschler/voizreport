export interface ReportTemplate {
  id: number;
  title: string;
  description: string;
  definition: string;
  form?: string;
  icon: string;
  openai_properties: Record<string, any>;
}

export interface SubmittedReport {
  id: number;
  title: string;
  templateType: string;
  date: string;
  status: 'Completed' | 'Under Review' | 'Draft';
  summary: string;
  plainText: string;
  json: Record<string, any>;
  isNew?: boolean;
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: 0,
    title: "Mini Report",
    description: "Document customer complaints, issues, and resolutions",
    definition: "Include customer details, issue description, actions taken, resolution status, and follow-up requirements. Focus on factual information and clear next steps.",
    icon: "🎧",
    openai_properties: {
      customer_name: { type: 'string', description: 'Customer full name' },
    },
    form: `
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "c5b1f2e4-2a6d-4f32-9c3b-7f4d8b1e1234",
  "name": "Customer Service Incident Report",
  "version": "1.0.0",
  "locale": "en-US",
  "description": "Template used to capture customer service incidents including complaint details, actions, and resolutions.",
  "fields": [
    {
      "key": "customer_name",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Please say the customer's full name.",
      "voice:reprompt": "I didn't catch the name. What is the customer's full name?",
      "voice:confirm": "Okay, customer is {{value}}."
    }
  ]
}
`
  },
  {
    id: 1,
    title: "Customer Service Incident Report",
    description: "Document customer complaints, issues, and resolutions",
    definition: "Include customer details, issue description, actions taken, resolution status, and follow-up requirements. Focus on factual information and clear next steps.",
    icon: "🎧",
    openai_properties: {
      customer_name: { type: 'string', description: 'Customer full name' },
      contact_information: { type: 'string', description: 'Customer contact information (email, phone)' },
      issue_description: { type: 'string', description: 'Description of the customer issue or complaint' },
      actions_taken: { type: 'string', description: 'Actions taken to address the issue' },
      resolution_status: { type: 'string', enum: ['Resolved', 'Pending', 'Escalated'], description: 'Current resolution status' },
      follow_up_required: { type: 'boolean', description: 'Whether follow-up is required' },
      follow_up_details: { type: 'string', description: 'Details about required follow-up actions' }
    },
    form: `
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "c5b1f2e4-2a6d-4f32-9c3b-7f4d8b1e1234",
  "name": "Customer Service Incident Report",
  "version": "1.0.0",
  "locale": "en-US",
  "description": "Template used to capture customer service incidents including complaint details, actions, and resolutions.",
  "fields": [
    {
      "key": "customer_name",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Please say the customer's full name.",
      "voice:reprompt": "I didn't catch the name. What is the customer's full name?",
      "voice:confirm": "Okay, customer is {{value}}."
    },
    {
      "key": "contact_information",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "What is the customer's contact information?",
      "voice:reprompt": "Please repeat the customer's contact information.",
      "voice:confirm": "Recorded contact information as {{value}}."
    },
    {
      "key": "issue_description",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Describe the customer's issue or complaint.",
      "voice:reprompt": "Can you describe the issue again?",
      "voice:confirm": "Noted issue: {{value}}."
    },
    {
      "key": "actions_taken",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "What actions were taken to address the issue?",
      "voice:reprompt": "Please repeat the actions taken.",
      "voice:confirm": "Documented actions: {{value}}."
    },
    {
      "key": "resolution_status",
      "type": "enum",
      "required": true,
      "enum": ["Resolved", "Pending", "Escalated"],
      "voice:prompt": "What is the resolution status? Say Resolved, Pending, or Escalated.",
      "voice:reprompt": "Please say Resolved, Pending, or Escalated.",
      "voice:confirm": "Status set to {{value}}.",
      "voice:synonyms": {
        "Resolved": ["fixed", "closed"],
        "Pending": ["in progress", "waiting"],
        "Escalated": ["sent to manager"]
      }
    },
    {
      "key": "follow_up_required",
      "type": "boolean",
      "required": true,
      "voice:prompt": "Is follow-up required? Say yes or no.",
      "voice:reprompt": "Please say yes or no for follow-up required.",
      "voice:confirm": "Follow-up required: {{value}}.",
      "voice:synonyms": {
        "true": ["yes", "yeah"],
        "false": ["no", "nope"]
      }
    },
    {
      "key": "follow_up_details",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "Provide follow-up details.",
      "voice:reprompt": "Can you repeat the follow-up details?",
      "voice:confirm": "Follow-up details noted: {{value}}."
    }
  ],
  "logic": [
    {
      "if": { "field": "follow_up_required", "equals": false },
      "then": { "skip": ["follow_up_details"] }
    }
  ]
}
`
  },
  {
    id: 2,
    title: "Safety Inspection Report",
    description: "Record workplace safety observations and violations",
    definition: "Document location, hazard type, severity level, immediate actions taken, and recommended long-term solutions. Include compliance requirements and timeline for corrections.",
    icon: "🛡️",
    openai_properties: {
      inspection_location: { type: 'string', description: 'Location where the inspection took place' },
      hazard_type: { type: 'string', enum: ['Fire Risk', 'Chemical Spill', 'Electrical', 'Trip Hazard', 'Other'], description: 'Type of hazard identified' },
      severity_level: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'], description: 'Severity level of the hazard' },
      immediate_actions: { type: 'string', description: 'Immediate actions taken to address the hazard' },
      recommended_solutions: { type: 'string', description: 'Long-term solutions recommended' },
      compliance_requirements: { type: 'string', description: 'Relevant compliance requirements' },
      correction_timeline: { type: 'string', description: 'Timeline for implementing corrections' }
    },
    form: `
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "d8a4f5c2-3b7e-4d12-af56-9b123e987654",
  "name": "Safety Inspection Report",
  "version": "1.0.0",
  "locale": "en-US",
  "description": "Template used to capture safety inspection details including hazards, actions, and recommendations.",
  "fields": [
    {
      "key": "inspection_location",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Please say the location of the inspection.",
      "voice:reprompt": "I didn't catch the location. What is the inspection location?",
      "voice:confirm": "Inspection location recorded as {{value}}."
    },
    {
      "key": "hazard_type",
      "type": "enum",
      "required": true,
      "enum": ["Fire Risk", "Chemical Spill", "Electrical", "Trip Hazard", "Other"],
      "voice:prompt": "What type of hazard? Say Fire Risk, Chemical Spill, Electrical, Trip Hazard, or Other.",
      "voice:reprompt": "Please repeat the hazard type.",
      "voice:confirm": "Hazard type set to {{value}}.",
      "voice:synonyms": {
        "Fire Risk": ["fire hazard", "flame risk"],
        "Chemical Spill": ["spill", "chemical leak"],
        "Electrical": ["electrical hazard"],
        "Trip Hazard": ["trip risk"],
        "Other": ["miscellaneous"]
      }
    },
    {
      "key": "severity_level",
      "type": "enum",
      "required": true,
      "enum": ["Low", "Medium", "High", "Critical"],
      "voice:prompt": "How severe is the hazard? Say Low, Medium, High, or Critical.",
      "voice:reprompt": "Tell me the severity: Low, Medium, High, or Critical.",
      "voice:confirm": "Severity level recorded as {{value}}."
    },
    {
      "key": "immediate_actions",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "What immediate actions were taken?",
      "voice:reprompt": "Please repeat the immediate actions taken.",
      "voice:confirm": "Immediate actions noted: {{value}}."
    },
    {
      "key": "recommended_solutions",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "What long-term solutions do you recommend?",
      "voice:reprompt": "Repeat your recommended long-term solutions.",
      "voice:confirm": "Recommended solutions: {{value}}."
    },
    {
      "key": "compliance_requirements",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "List any compliance requirements.",
      "voice:reprompt": "Repeat any compliance requirements.",
      "voice:confirm": "Compliance requirements recorded: {{value}}."
    },
    {
      "key": "correction_timeline",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "What is the timeline for corrections?",
      "voice:reprompt": "Please repeat the correction timeline.",
      "voice:confirm": "Correction timeline set to {{value}}."
    }
  ],
  "logic": []
}
`
  },
  {
    id: 3,
    title: "Equipment Maintenance Report",
    description: "Track equipment status and maintenance activities",
    definition: "Include equipment ID, condition assessment, maintenance performed, parts replaced, operational status, and next scheduled maintenance date.",
    icon: "⚙️",
    openai_properties: {
      equipment_id: { type: 'string', description: 'Equipment identification number (format: EQ-XXXX)' },
      condition_assessment: { type: 'string', description: 'Assessment of equipment condition' },
      maintenance_performed: { type: 'string', description: 'Description of maintenance work performed' },
      parts_replaced: { 
        type: 'array', 
        description: 'List of parts that were replaced',
        items: {
          type: 'object',
          properties: {
            part_name: { type: 'string', description: 'Name of the replaced part' },
            part_number: { type: 'string', description: 'Part number or identifier' }
          }
        }
      },
      operational_status: { type: 'string', enum: ['Operational', 'Non-Operational', 'Needs Repair'], description: 'Current operational status of equipment' },
      next_maintenance_date: { type: 'string', description: 'Date of next scheduled maintenance' }
    },
    form: `
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "e3b2c7d4-5f68-4a19-ba45-8b765d43210f",
  "name": "Equipment Maintenance Report",
  "version": "1.0.0",
  "locale": "en-US",
  "description": "Template used to capture equipment maintenance details including assessment, work done, and next maintenance schedule.",
  "fields": [
    {
      "key": "equipment_id",
      "type": "string",
      "required": true,
      "pattern": "EQ-\\d{4}",
      "voice:prompt": "Please say the equipment ID, like E Q dash 1 2 3 4.",
      "voice:reprompt": "I didn't catch the equipment ID. Please say it again.",
      "voice:confirm": "Recorded equipment ID as {{value}}."
    },
    {
      "key": "condition_assessment",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Describe the equipment's condition.",
      "voice:reprompt": "Please repeat the equipment condition assessment.",
      "voice:confirm": "Condition noted: {{value}}."
    },
    {
      "key": "maintenance_performed",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "What maintenance was performed?",
      "voice:reprompt": "Repeat the maintenance performed.",
      "voice:confirm": "Maintenance performed: {{value}}."
    },
    {
      "key": "parts_replaced",
      "type": "array",
      "required": false,
      "voice:prompt": "List any parts replaced, one at a time. Say 'no more' when finished.",
      "voice:reprompt": "Please say the part name and part number, or say 'no more'.",
      "voice:confirm": "Added {{last_item}} to replaced parts.",
      "items": {
        "type": "object",
        "properties": {
          "part_name": {
            "type": "string",
            "voice:prompt": "What part was replaced?",
            "voice:reprompt": "Repeat the part name, please.",
            "voice:confirm": "Part replaced: {{value}}."
          },
          "part_number": {
            "type": "string",
            "voice:prompt": "What is the part number?",
            "voice:reprompt": "Please repeat the part number.",
            "voice:confirm": "Part number recorded: {{value}}."
          }
        },
        "required": ["part_name", "part_number"]
      }
    },
    {
      "key": "operational_status",
      "type": "enum",
      "required": true,
      "enum": ["Operational", "Non-Operational", "Needs Repair"],
      "voice:prompt": "Is the equipment Operational, Non-Operational, or Needs Repair?",
      "voice:reprompt": "Please say Operational, Non-Operational, or Needs Repair.",
      "voice:confirm": "Equipment status: {{value}}."
    },
    {
      "key": "next_maintenance_date",
      "type": "string",
      "format": "date",
      "required": false,
      "voice:prompt": "When is the next maintenance scheduled? Say the date.",
      "voice:reprompt": "I didn't catch the next maintenance date. Please repeat.",
      "voice:confirm": "Next maintenance date set to {{value}}."
    }
  ],
  "logic": []
}
`
  },
  {
    id: 4,
    title: "Daily Operations Summary",
    description: "Summarize daily activities and key metrics",
    definition: "Cover key performance indicators, notable events, staffing levels, issues encountered, and recommendations for improvement.",
    icon: "📊",
    openai_properties: {
      kpi_report: { type: 'string', description: 'Summary of key performance indicators for the day' },
      notable_events: { type: 'string', description: 'Notable events or incidents that occurred' },
      staffing_levels: { type: 'number', description: 'Number of staff members on duty' },
      issues_encountered: { type: 'string', description: 'Issues or problems encountered during operations' },
      recommendations: { type: 'string', description: 'Recommendations for operational improvements' }
    },
    form: `
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "f4a9d2b8-6e73-4c5a-afe5-2d9b761fe321",
  "name": "Daily Operations Summary",
  "version": "1.0.0",
  "locale": "en-US",
  "description": "Template used to capture a summary of daily operations including KPIs, events, staffing, and recommendations.",
  "fields": [
    {
      "key": "kpi_report",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Please summarize today's key performance indicators.",
      "voice:reprompt": "Can you repeat the KPIs summary?",
      "voice:confirm": "KPIs noted: {{value}}."
    },
    {
      "key": "notable_events",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "Mention any notable events or incidents today.",
      "voice:reprompt": "Please repeat any notable events or incidents.",
      "voice:confirm": "Notable events: {{value}}."
    },
    {
      "key": "staffing_levels",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 1000,
      "voice:prompt": "How many staff members were on duty today?",
      "voice:reprompt": "Please repeat the number of staff on duty.",
      "voice:confirm": "Staffing level recorded as {{value}}."
    },
    {
      "key": "issues_encountered",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "Describe any issues encountered today.",
      "voice:reprompt": "Please repeat any issues encountered.",
      "voice:confirm": "Issues encountered: {{value}}."
    },
    {
      "key": "recommendations",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "What recommendations do you have for improvement?",
      "voice:reprompt": "Repeat your recommendations, please.",
      "voice:confirm": "Recommendations noted: {{value}}."
    }
  ],
  "logic": []
}
`
  },
  {
    id: 5,
    title: "Healthcare Worker Home-Visit Report",
    description: "Record patient vitals, medications, observations, and next steps during home visits",
    definition: "Collect patient information including: full name and age, vital signs (blood pressure systolic/diastolic, heart rate, respiratory rate, temperature in Fahrenheit), any medications administered with names and doses, physical observations (wound status, swelling, etc.), patient complaints or symptoms, pain level (0-10 scale), instructions given to patient, next visit scheduling (date and time), and any additional notes. Be thorough and precise with medical data.",
    icon: "🏥",
    openai_properties: {
      patient_name: { type: 'string', description: 'Patient full name' },
      patient_age: { type: 'number', description: 'Patient age in years' },
      blood_pressure_systolic: { type: 'number', description: 'Systolic blood pressure' },
      blood_pressure_diastolic: { type: 'number', description: 'Diastolic blood pressure' },
      heart_rate: { type: 'number', description: 'Heart rate in BPM' },
      respiratory_rate: { type: 'number', description: 'Respiratory rate in breaths per minute' },
      temperature_f: { type: 'number', description: 'Temperature in Fahrenheit' },
      medications_administered: { 
        type: 'array', 
        description: 'List of medications given',
        items: {
          type: 'object',
          properties: {
            med_name: { type: 'string', description: 'Medication name' },
            med_dose: { type: 'string', description: 'Dosage amount and units' }
          }
        }
      },
      observations: { type: 'string', description: 'Physical observations and notes' },
      patient_complaints: { type: 'string', description: 'Patient complaints or symptoms' },
      pain_level: { type: 'number', description: 'Pain level on 0-10 scale' },
      instructions_given: { type: 'string', description: 'Instructions provided to patient' },
      next_visit_date: { type: 'string', description: 'Next scheduled visit date' },
      next_visit_time: { type: 'string', description: 'Next scheduled visit time' },
      additional_notes: { type: 'string', description: 'Any additional notes' }
    },
    form: `
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "a72d3f5c-4c72-4ec4-9a2f-8b317e84f9a1",
  "name": "Healthcare Worker Home-Visit Report",
  "version": "1.0.0",
  "locale": "en-US",
  "description": "Template used by mobile healthcare workers to record patient vitals, medications, observations, and next steps during a home visit.",
  "fields": [
    {
      "key": "patient_name",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Please say the patient's full name.",
      "voice:reprompt": "I didn't catch the name. What is the patient's full name?",
      "voice:confirm": "Okay, patient is {{value}}."
    },
    {
      "key": "patient_age",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 120,
      "voice:prompt": "What is the patient's age in years?",
      "voice:reprompt": "Sorry, please repeat the patient's age.",
      "voice:confirm": "Understood, age {{value}}."
    },
    {
      "key": "blood_pressure_systolic",
      "type": "number",
      "required": true,
      "min": 50,
      "max": 250,
      "voice:prompt": "What was the systolic blood pressure?",
      "voice:reprompt": "Please say the systolic value again.",
      "voice:confirm": "Got it, systolic is {{value}}."
    },
    {
      "key": "blood_pressure_diastolic",
      "type": "number",
      "required": true,
      "min": 30,
      "max": 150,
      "voice:prompt": "What was the diastolic blood pressure?",
      "voice:reprompt": "I didn't catch the diastolic number. Please repeat.",
      "voice:confirm": "Okay, diastolic is {{value}}."
    },
    {
      "key": "heart_rate",
      "type": "number",
      "required": true,
      "min": 30,
      "max": 200,
      "voice:prompt": "What is the patient's heart rate, in beats per minute?",
      "voice:reprompt": "Please repeat the heart rate.",
      "voice:confirm": "Thank you, heart rate {{value}} bpm."
    },
    {
      "key": "respiratory_rate",
      "type": "number",
      "required": true,
      "min": 5,
      "max": 40,
      "voice:prompt": "What is the respiratory rate in breaths per minute?",
      "voice:reprompt": "I need the respiratory rate again, please.",
      "voice:confirm": "Recorded, respiratory rate {{value}}."
    },
    {
      "key": "temperature_f",
      "type": "number",
      "required": true,
      "min": 90,
      "max": 110,
      "voice:prompt": "What is the patient's temperature in Fahrenheit?",
      "voice:reprompt": "Sorry, repeat the temperature reading, please.",
      "voice:confirm": "Got it, temperature {{value}}°F."
    },
    {
      "key": "medications_administered",
      "type": "array",
      "required": false,
      "voice:prompt": "List any medications you administered, one at a time. Say 'no more' when finished.",
      "voice:reprompt": "Please tell me the medication name and dose, or say 'no more' if none.",
      "voice:confirm": "Added {{last_item}} to medications.",
      "items": {
        "type": "object",
        "properties": {
          "med_name": {
            "type": "string",
            "voice:prompt": "Medication name?",
            "voice:reprompt": "Repeat the medication name, please.",
            "voice:confirm": "Medication is {{value}}."
          },
          "med_dose": {
            "type": "string",
            "voice:prompt": "Dose amount and units?",
            "voice:reprompt": "Please repeat dose amount and units.",
            "voice:confirm": "Dose recorded as {{value}}."
          }
        },
        "required": ["med_name", "med_dose"]
      }
    },
    {
      "key": "observations",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Describe any physical observations (e.g., wound status, swelling).",
      "voice:reprompt": "Please describe your observations again.",
      "voice:confirm": "Noted: {{value}}."
    },
    {
      "key": "patient_complaints",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "What complaints or symptoms did the patient report?",
      "voice:reprompt": "Repeat any patient complaints or symptoms.",
      "voice:confirm": "Understood, patient reported: {{value}}."
    },
    {
      "key": "pain_level",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 10,
      "voice:prompt": "If applicable, what pain level did the patient report on a scale of zero to ten?",
      "voice:reprompt": "Please repeat the pain level zero to ten.",
      "voice:confirm": "Got it, pain level {{value}}."
    },
    {
      "key": "instructions_given",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "What instructions or advice did you give the patient?",
      "voice:reprompt": "Repeat the instructions you provided, please.",
      "voice:confirm": "Confirmed: instructions were {{value}}."
    },
    {
      "key": "next_visit_date",
      "type": "string",
      "format": "date",
      "required": false,
      "voice:prompt": "When is the next scheduled visit? Please say the date.",
      "voice:reprompt": "I didn't catch the date for the next visit. Please repeat.",
      "voice:confirm": "Next visit date set to {{value}}."
    },
    {
      "key": "next_visit_time",
      "type": "string",
      "format": "time",
      "required": false,
      "voice:prompt": "At what time is the next appointment?",
      "voice:reprompt": "Repeat the time for the next visit, please.",
      "voice:confirm": "Next visit time is {{value}}."
    },
    {
      "key": "additional_notes",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "Any additional notes to record?",
      "voice:reprompt": "Please say any other notes you want to add.",
      "voice:confirm": "Got it: {{value}}."
    }
  ],
  "logic": [
    {
      "if": { "field": "patient_complaints", "equals": "" },
      "then": { "skip": ["pain_level"] }
    }
  ]
}
`
  }
];

export const submittedReports: SubmittedReport[] = [
  {
    id: 1,
    title: "Customer Service Incident - Login Issues",
    templateType: "Customer Service Incident Report",
    date: "2024-01-15",
    status: "Completed",
    summary: "Multiple customers reported login difficulties...",
    plainText: `Customer Name: John Smith
Contact Information: john.smith@email.com, (555) 123-4567
Issue Description: Unable to log into account for 3 days, receiving 'invalid credentials' error
Actions Taken: Reset password, cleared cache, verified account status
Resolution Status: Resolved
Follow Up Required: false`,
    json: {
      timestamp: 1642276200000,
      completed_at: "2024-01-15T19:30:00.000Z",
      data: {
        customer_name: "John Smith",
        contact_information: "john.smith@email.com, (555) 123-4567",
        issue_description: "Unable to log into account for 3 days, receiving 'invalid credentials' error",
        actions_taken: "Reset password, cleared cache, verified account status",
        resolution_status: "Resolved",
        follow_up_required: false
      },
    }
  },
  {
    id: 2,
    title: "Safety Check - Main Floor",
    templateType: "Safety Inspection Report",
    date: "2024-01-14",
    status: "Under Review",
    summary: "Routine safety inspection identified minor issues...",
    plainText: `Inspection Location: Main Floor - Assembly Area
Hazard Type: Trip Hazard
Severity Level: Medium
Immediate Actions: Placed warning cones, cordoned off area
Recommended Solutions: Replace damaged flooring tiles, improve lighting
Compliance Requirements: OSHA workplace safety standards
Correction Timeline: Within 2 weeks`,
    json: {
      timestamp: 1642161300000,
      completed_at: "2024-01-14T15:15:00.000Z",
      data: {
        inspection_location: "Main Floor - Assembly Area",
        hazard_type: "Trip Hazard",
        severity_level: "Medium",
        immediate_actions: "Placed warning cones, cordoned off area",
        recommended_solutions: "Replace damaged flooring tiles, improve lighting",
        compliance_requirements: "OSHA workplace safety standards",
        correction_timeline: "Within 2 weeks"
      },
    }
  },
  {
    id: 3,
    title: "Server Maintenance - Database Update",
    templateType: "Equipment Maintenance Report",
    date: "2024-01-13",
    status: "Completed",
    summary: "Successfully updated database servers...",
    plainText: `Equipment Id: EQ-3001
Condition Assessment: Good condition, minor performance degradation noted
Maintenance Performed: Updated database software, optimized queries, cleaned server room
Parts Replaced: Cooling fan (Part #CF-2024), RAM module (Part #RAM-16GB-DDR4)
Operational Status: Operational
Next Maintenance Date: 2024-07-13`,
    json: {
      timestamp: 1642089900000,
      completed_at: "2024-01-13T21:45:00.000Z",
      data: {
        equipment_id: "EQ-3001",
        condition_assessment: "Good condition, minor performance degradation noted",
        maintenance_performed: "Updated database software, optimized queries, cleaned server room",
        parts_replaced: [
          { part_name: "Cooling fan", part_number: "CF-2024" },
          { part_name: "RAM module", part_number: "RAM-16GB-DDR4" }
        ],
        operational_status: "Operational",
        next_maintenance_date: "2024-07-13"
      },
    }
  }
]; 