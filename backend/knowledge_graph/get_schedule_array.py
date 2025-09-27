import json
from knowledge_graph_generator import TalkSchedulerKnowledgeGraph

def get_talk_schedule_via_traversal(start_node=None):
    """Get ordered array of talk IDs via graph traversal"""
    scheduler = TalkSchedulerKnowledgeGraph('example_abstarcts.json')
    scheduler.build_knowledge_graph()
    return scheduler.generate_schedule_via_graph_traversal(start_node)

def get_detailed_schedule_via_traversal(start_node=None):
    """Get detailed schedule via graph traversal"""
    scheduler = TalkSchedulerKnowledgeGraph('example_abstarcts.json')
    scheduler.build_knowledge_graph()
    return scheduler.generate_detailed_schedule_from_traversal(start_node)

if __name__ == "__main__":
    print("=== GRAPH TRAVERSAL SCHEDULING ===")
    
    try:
        # Get the traversal sequence
        sequence = get_talk_schedule_via_traversal()
        print(f"Successfully scheduled {len(sequence)} talks via graph traversal")
        print("Talk sequence:", sequence)
        
        print("\n=== JSON FORMAT ===")
        print(json.dumps(sequence, indent=2))
        
        print("\n=== DETAILED TRAVERSAL SCHEDULE ===")
        detailed = get_detailed_schedule_via_traversal()
        
        for session in detailed:
            print(f"{session['session_order']:2d}. {session['talk_id']} - {session['title']} ({session['difficulty']})")
            if session['prerequisites']:
                prereq_ids = ", ".join(session['prerequisites'])
                print(f"    Prerequisites: {prereq_ids}")
        
        print(f"\n=== SUMMARY ===")
        print(f"Total talks scheduled: {len(sequence)}")
        print(f"Starting from optimal node, traversed the entire knowledge graph")
        
    except ValueError as e:
        print(f"Error: {e}")
        print("Make sure the knowledge graph is acyclic")