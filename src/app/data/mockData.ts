export interface ReportTemplate {
  id: number;
  title: string;
  description: string;
  definition: string;
  icon: string;
  openai_properties: Record<string, any>;
  required_fields?: string[];
}

export interface PhotoAttachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  dataUrl: string;
  capturedAt: string;
  fieldName?: string; // If photo is associated with a specific form field
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
  photoAttachments?: PhotoAttachment[];
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
      customer_age: { type: 'number', description: 'Customer age in years' },
      customer_gender: { type: 'string', enum: ['Male', 'Female', 'Other'], description: 'Customer gender' },
    },
    required_fields: ['customer_name'],
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
  },
  {
    id: 6,
    title: "Real Estate Property Inspection Report",
    description: "Comprehensive property condition assessment for buyers, sellers, or insurance",
    definition: "Document property details, structural conditions, electrical and plumbing systems, HVAC status, exterior conditions, safety concerns, estimated repair costs, and overall property rating. Include photos and detailed observations for each major system.",
    icon: "🏠",
    openai_properties: {
      property_address: { type: 'string', description: 'Full property address' },
      property_type: { type: 'string', enum: ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Commercial'], description: 'Type of property' },
      square_footage: { type: 'number', description: 'Total square footage' },
      year_built: { type: 'number', description: 'Year the property was built' },
      structural_condition: { type: 'string', enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'], description: 'Overall structural condition' },
      electrical_system: { type: 'string', enum: ['Up to Code', 'Needs Minor Updates', 'Needs Major Updates', 'Safety Hazard'], description: 'Electrical system condition' },
      plumbing_system: { type: 'string', enum: ['Excellent', 'Good', 'Needs Repair', 'Needs Replacement'], description: 'Plumbing system condition' },
      hvac_condition: { type: 'string', enum: ['Excellent', 'Good', 'Needs Service', 'Needs Replacement'], description: 'HVAC system condition' },
      roof_condition: { type: 'string', enum: ['New', 'Good', 'Needs Minor Repair', 'Needs Major Repair', 'Needs Replacement'], description: 'Roof condition' },
      safety_concerns: { 
        type: 'array', 
        description: 'List of safety issues found',
        items: { type: 'string' }
      },
      estimated_repair_cost: { type: 'number', description: 'Estimated cost for necessary repairs' },
      overall_rating: { type: 'string', enum: ['Excellent', 'Good', 'Fair', 'Poor'], description: 'Overall property rating' }
    },
  },
  {
    id: 7,
    title: "Restaurant Food Safety Audit Report",
    description: "Document food safety compliance and health code violations",
    definition: "Assess food storage temperatures, staff hygiene practices, kitchen cleanliness, equipment sanitization, food handling procedures, pest control, and regulatory compliance. Include violation severity levels and corrective action timelines.",
    icon: "🍽️",
    openai_properties: {
      restaurant_name: { type: 'string', description: 'Name of the restaurant' },
      audit_date: { type: 'string', description: 'Date of the audit' },
      food_storage_temp: { type: 'string', enum: ['Compliant', 'Minor Issues', 'Major Violations'], description: 'Food storage temperature compliance' },
      staff_hygiene: { type: 'string', enum: ['Excellent', 'Good', 'Needs Improvement', 'Poor'], description: 'Staff hygiene practices' },
      kitchen_cleanliness: { type: 'string', enum: ['Excellent', 'Good', 'Acceptable', 'Unacceptable'], description: 'Kitchen cleanliness level' },
      equipment_sanitization: { type: 'string', enum: ['Proper', 'Mostly Proper', 'Inadequate', 'Non-Compliant'], description: 'Equipment sanitization status' },
      violations_found: { 
        type: 'array', 
        description: 'List of health code violations',
        items: {
          type: 'object',
          properties: {
            violation_type: { type: 'string', description: 'Type of violation' },
            severity: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'], description: 'Violation severity' },
            location: { type: 'string', description: 'Location where violation was found' }
          }
        }
      },
      pest_control_status: { type: 'string', enum: ['No Issues', 'Minor Signs', 'Active Infestation'], description: 'Pest control status' },
      overall_compliance_score: { type: 'number', description: 'Overall compliance score out of 100' },
      corrective_actions_required: { type: 'string', description: 'Required corrective actions' },
      reinspection_date: { type: 'string', description: 'Date for required reinspection' }
    },
  },
  {
    id: 8,
    title: "Project Status Report",
    description: "Track project progress, milestones, and resource allocation",
    definition: "Document project timeline, budget status, milestone completion, resource utilization, risk assessment, stakeholder communication, and next phase planning. Include percentage completion and variance analysis.",
    icon: "📋",
    openai_properties: {
      project_name: { type: 'string', description: 'Name of the project' },
      project_manager: { type: 'string', description: 'Project manager name' },
      start_date: { type: 'string', description: 'Project start date' },
      target_completion_date: { type: 'string', description: 'Target completion date' },
      current_phase: { type: 'string', description: 'Current project phase' },
      completion_percentage: { type: 'number', description: 'Overall completion percentage (0-100)' },
      budget_allocated: { type: 'number', description: 'Total budget allocated' },
      budget_spent: { type: 'number', description: 'Amount of budget spent to date' },
      milestones_completed: { 
        type: 'array', 
        description: 'List of completed milestones',
        items: {
          type: 'object',
          properties: {
            milestone_name: { type: 'string', description: 'Milestone name' },
            completion_date: { type: 'string', description: 'Date milestone was completed' }
          }
        }
      },
      upcoming_milestones: { 
        type: 'array', 
        description: 'List of upcoming milestones',
        items: {
          type: 'object',
          properties: {
            milestone_name: { type: 'string', description: 'Milestone name' },
            target_date: { type: 'string', description: 'Target completion date' }
          }
        }
      },
      risks_identified: { type: 'string', description: 'Identified project risks and mitigation strategies' },
      resource_utilization: { type: 'string', enum: ['Under-utilized', 'Optimal', 'Over-utilized', 'Critical'], description: 'Current resource utilization status' },
      next_steps: { type: 'string', description: 'Planned next steps and actions' }
    },
  },
  {
    id: 9,
    title: "Employee Performance Review Report",
    description: "Evaluate employee performance, goals, and development needs",
    definition: "Assess job performance against objectives, core competencies, achievements, areas for improvement, goal setting for next period, training needs, and career development discussions. Include quantitative ratings and qualitative feedback.",
    icon: "👤",
    openai_properties: {
      employee_name: { type: 'string', description: 'Employee full name' },
      employee_id: { type: 'string', description: 'Employee identification number' },
      position_title: { type: 'string', description: 'Employee job title' },
      department: { type: 'string', description: 'Department name' },
      review_period_start: { type: 'string', description: 'Start date of review period' },
      review_period_end: { type: 'string', description: 'End date of review period' },
      overall_performance_rating: { type: 'string', enum: ['Exceeds Expectations', 'Meets Expectations', 'Below Expectations', 'Unsatisfactory'], description: 'Overall performance rating' },
      goals_achievement: { type: 'string', enum: ['All Goals Met', 'Most Goals Met', 'Some Goals Met', 'Few Goals Met'], description: 'Achievement of set goals' },
      key_accomplishments: { type: 'string', description: 'Major accomplishments during review period' },
      areas_for_improvement: { type: 'string', description: 'Areas identified for improvement' },
      core_competencies_rating: {
        type: 'object',
        description: 'Ratings for core competencies',
        properties: {
          communication: { type: 'number', description: 'Communication skills rating (1-5)' },
          teamwork: { type: 'number', description: 'Teamwork rating (1-5)' },
          problem_solving: { type: 'number', description: 'Problem-solving rating (1-5)' },
          leadership: { type: 'number', description: 'Leadership skills rating (1-5)' }
        }
      },
      training_needs: { type: 'string', description: 'Identified training and development needs' },
      career_development_goals: { type: 'string', description: 'Career development goals and aspirations' },
      next_review_date: { type: 'string', description: 'Date of next scheduled review' }
    },
  }
];