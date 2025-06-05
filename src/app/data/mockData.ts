export interface ReportTemplate {
  id: number;
  title: string;
  description: string;
  definition: string;
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