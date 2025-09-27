import json
import os
import logging
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from knowledge_graph_generator import TalkSchedulerKnowledgeGraph

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Get the directory where this script is located
BASE_DIR = Path(__file__).resolve().parent

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure necessary files exist
ABSTRACTS_FILE = BASE_DIR / 'example_abstarcts.json'
SCHEDULE_FILE = BASE_DIR / 'conference_schedule.json'

if not ABSTRACTS_FILE.exists():
    logger.warning(f"Abstracts file not found at {ABSTRACTS_FILE}. API might not work correctly.")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API server is running"})

@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    """Get the complete conference schedule"""
    try:
        # Get optional parameters
        start_node = request.args.get('start_node', None)
        view_type = request.args.get('view', 'default')
        
        # Initialize the scheduler with absolute path to abstracts file
        abstracts_path = str(ABSTRACTS_FILE)
        logger.info(f"Loading abstracts from: {abstracts_path}")
        scheduler = TalkSchedulerKnowledgeGraph(abstracts_path)
        scheduler.build_knowledge_graph()
        
        # Get detailed schedule
        schedule = scheduler.generate_detailed_schedule_from_traversal(start_node)
        
        # Format the schedule based on view type
        if view_type == 'track':
            formatted_schedule = format_schedule_by_track(schedule)
        elif view_type == 'day':
            formatted_schedule = format_schedule_by_day(schedule)
        else:
            formatted_schedule = format_schedule_default(schedule)
        
        # Return the schedule as JSON
        return jsonify({
            "status": "success",
            "data": formatted_schedule,
            "metadata": {
                "total_sessions": len(schedule),
                "view_type": view_type,
                "scheduling_algorithm": "Knowledge Graph + Topological Sort"
            }
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/schedule/generate', methods=['POST'])
def generate_schedule():
    """Generate a new schedule based on the provided abstracts"""
    try:
        # Get the abstracts from the request
        data = request.json
        abstracts = data.get('abstracts', [])
        
        # Write abstracts to a temporary file with absolute path
        temp_abstracts_path = str(BASE_DIR / 'temp_abstracts.json')
        logger.info(f"Writing temporary abstracts to: {temp_abstracts_path}")
        with open(temp_abstracts_path, 'w') as f:
            json.dump(abstracts, f)
        
        # Initialize the scheduler with the temporary file
        scheduler = TalkSchedulerKnowledgeGraph(temp_abstracts_path)
        scheduler.build_knowledge_graph()
        
        # Generate the schedule
        schedule = scheduler.generate_detailed_schedule_from_traversal()
        
        # Save the schedule to conference_schedule.json with absolute path
        schedule_path = str(SCHEDULE_FILE)
        logger.info(f"Saving schedule to: {schedule_path}")
        with open(schedule_path, 'w') as f:
            json.dump({
                "conference_schedule": {
                    "total_sessions": len(schedule),
                    "scheduling_algorithm": "Knowledge Graph + Topological Sort",
                    "principles": [
                        "Prerequisites must come before dependent topics",
                        "Beginner content before intermediate/advanced",
                        "Related topics grouped together",
                        "Logical progression within topic areas"
                    ],
                    "sessions": schedule
                }
            }, f, indent=2)
        
        # Clean up temp file with absolute path
        temp_abstracts_path = str(BASE_DIR / 'temp_abstracts.json')
        if os.path.exists(temp_abstracts_path):
            os.remove(temp_abstracts_path)
        
        # Return the generated schedule
        return jsonify({
            "status": "success",
            "data": {
                "total_sessions": len(schedule),
                "schedule": schedule
            },
            "message": "Schedule generated successfully"
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/schedule/saved', methods=['GET'])
def get_saved_schedule():
    """Get the saved conference schedule from file"""
    try:
        # Read the saved schedule with absolute path
        schedule_path = str(SCHEDULE_FILE)
        logger.info(f"Reading schedule from: {schedule_path}")
        with open(schedule_path, 'r') as f:
            schedule_data = json.load(f)
        
        return jsonify({
            "status": "success",
            "data": schedule_data
        })
    
    except FileNotFoundError:
        return jsonify({
            "status": "error",
            "message": "No saved schedule found"
        }), 404
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Helper functions to format the schedule in different ways
def format_schedule_default(schedule):
    """Format the schedule as a flat list"""
    # Add time slots based on session order
    time_slots = [
        "09:00", "09:45", "10:30", "11:15", "12:00", 
        "13:00", "13:45", "14:30", "15:15", "16:00", 
        "16:45", "17:30"
    ]
    
    # Add days based on session order
    for i, session in enumerate(schedule):
        day = (i // 10) + 1  # 10 sessions per day
        time_index = i % 10
        if time_index >= len(time_slots):
            time_index = len(time_slots) - 1
        
        session['day'] = f"Day {day}"
        session['time'] = time_slots[time_index]
        
        # Calculate duration based on difficulty
        if session['difficulty'] == 'Beginner':
            session['duration'] = 45
        elif session['difficulty'] == 'Intermediate':
            session['duration'] = 50
        else:  # Advanced
            session['duration'] = 60
        
        # Assign location and track based on topics
        primary_topic = session['topic_tags'][0] if session['topic_tags'] else "General"
        
        if "Deep Learning" in session['topic_tags'] or "Machine Learning" in session['topic_tags']:
            session['track'] = "Machine Learning Track"
            session['location'] = "Hall A"
        elif "NLP" in session['topic_tags'] or "LLM" in session['topic_tags']:
            session['track'] = "NLP & Language Models Track"
            session['location'] = "Hall B"
        elif "Data" in primary_topic:
            session['track'] = "Data Engineering Track"
            session['location'] = "Hall C"
        else:
            session['track'] = "General Track"
            session['location'] = "Main Auditorium"
    
    return schedule

def format_schedule_by_track(schedule):
    """Format the schedule grouped by tracks"""
    tracks = {}
    formatted_schedule = format_schedule_default(schedule)
    
    for session in formatted_schedule:
        track = session['track']
        if track not in tracks:
            tracks[track] = []
        tracks[track].append(session)
    
    return {
        "tracks": [
            {
                "name": track_name,
                "sessions": sorted(sessions, key=lambda s: (s['day'], s['time']))
            } for track_name, sessions in tracks.items()
        ]
    }

def format_schedule_by_day(schedule):
    """Format the schedule grouped by days"""
    days = {}
    formatted_schedule = format_schedule_default(schedule)
    
    for session in formatted_schedule:
        day = session['day']
        if day not in days:
            days[day] = []
        days[day].append(session)
    
    return {
        "days": [
            {
                "name": day_name,
                "sessions": sorted(sessions, key=lambda s: s['time'])
            } for day_name, sessions in days.items()
        ]
    }

if __name__ == '__main__':
    try:
        # Use 0.0.0.0 to make the server accessible from other machines on the network
        # Set debug to False for production deployment
        port = int(os.environ.get('PORT', 5000))
        host = os.environ.get('HOST', '0.0.0.0')
        debug = os.environ.get('DEBUG', 'False').lower() == 'true'
        
        logger.info(f"Starting API server on {host}:{port}, debug mode: {debug}")
        app.run(host=host, port=port, debug=debug)
    except Exception as e:
        logger.error(f"Error starting the server: {str(e)}")
        raise
