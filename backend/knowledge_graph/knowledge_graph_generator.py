import json
import networkx as nx
from typing import Dict, List, Set, Tuple
import matplotlib.pyplot as plt
import numpy as np
from collections import defaultdict, deque

class TalkSchedulerKnowledgeGraph:
    def __init__(self, abstracts_file: str):
        with open(abstracts_file, 'r') as f:
            self.talks = json.load(f)
        
        # Create the knowledge graph
        self.graph = nx.DiGraph()
        self.topic_clusters = defaultdict(list)
        self.dependency_map = {}
        
        # Difficulty level mapping
        self.difficulty_levels = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
        
        # Define topic relationships and prerequisites (simplified to avoid cycles)
        self.topic_prerequisites = {
            # Core foundations
            "Core Concepts": [],
            "Statistics": [],
            "Machine Learning": ["Core Concepts"],
            
            # Data foundations
            "Data Engineering": ["Core Concepts"],
            "Data Visualization": ["Core Concepts"],
            "SQL": ["Core Concepts"],
            "ETL": ["Data Engineering"],
            "Cloud": ["Data Engineering"],
            "Data Warehouse": ["Data Engineering"],
            
            # ML progressions
            "Deep Learning": ["Machine Learning"],
            "CNN": ["Deep Learning"],
            "NLP": ["Machine Learning"],
            "Computer Vision": ["Machine Learning"],
            "Reinforcement Learning": ["Machine Learning"],
            
            # Advanced topics
            "Transformers": ["Deep Learning", "NLP"],
            "LLM": ["NLP", "Deep Learning"],
            "Generative AI": ["Deep Learning"],
            "GANs": ["Deep Learning"],
            "Diffusion Models": ["Deep Learning"],
            "Graph Neural Networks": ["Deep Learning"],
            
            # Applied areas
            "Fine-Tuning": ["LLM"],
            "MLOps": ["Machine Learning"],
            "XAI": ["Machine Learning"],
            "Forecasting": ["Statistics"],
            "Recommender Systems": ["Machine Learning"],
            "Anomaly Detection": ["Machine Learning"],
            
            # Infrastructure
            "Vector Database": ["LLM"],
            "Airflow": ["Data Engineering"],
            "Edge AI": ["Deep Learning"],
            "Embeddings": ["Machine Learning"],
            
            # Non-technical
            "AI Ethics": [],
            "Product Management": [],
            "Business": [],
            "Future Tech": [],
            "Legal": []
        }
    
    def build_knowledge_graph(self):
        """Build the knowledge graph with talks as nodes and dependencies as edges"""
        
        # Add all talks as nodes
        for talk in self.talks:
            self.graph.add_node(talk['talk_id'], 
                              title=talk['title'],
                              abstract=talk['abstract'],
                              difficulty=talk['difficulty'],
                              difficulty_level=self.difficulty_levels[talk['difficulty']],
                              tags=talk['topic_tags'])
            
            # Group talks by topic clusters
            for tag in talk['topic_tags']:
                self.topic_clusters[tag].append(talk['talk_id'])
        
        # Add dependency edges between talks
        self._add_dependency_edges()
        
        # Add ordering edges within topics
        self._add_difficulty_ordering()
        
        # Remove any cycles that might have been created
        self._remove_cycles()
    
    def _add_dependency_edges(self):
        """Add edges based on topic prerequisites"""
        for talk in self.talks:
            talk_id = talk['talk_id']
            talk_tags = set(talk['topic_tags'])
            talk_difficulty = self.difficulty_levels[talk['difficulty']]
            
            # Check for prerequisite relationships
            for tag in talk_tags:
                if tag in self.topic_prerequisites:
                    prerequisites = self.topic_prerequisites[tag]
                    
                    # Find talks that cover the prerequisites
                    for prereq in prerequisites:
                        prereq_talks = self.topic_clusters.get(prereq, [])
                        for prereq_talk in prereq_talks:
                            if prereq_talk != talk_id:
                                # Get prerequisite talk difficulty
                                prereq_talk_data = next(t for t in self.talks if t['talk_id'] == prereq_talk)
                                prereq_difficulty = self.difficulty_levels[prereq_talk_data['difficulty']]
                                
                                # Only add edge if prerequisite is easier or same difficulty
                                # This prevents cycles from difficulty mismatches
                                if prereq_difficulty <= talk_difficulty:
                                    # Check if adding this edge would create a cycle
                                    if not self._would_create_cycle(prereq_talk, talk_id):
                                        self.graph.add_edge(prereq_talk, talk_id, 
                                                          relationship='prerequisite',
                                                          weight=1.0)
    
    def _add_difficulty_ordering(self):
        """Add ordering edges within the same topic cluster based on difficulty"""
        for topic, talk_ids in self.topic_clusters.items():
            if len(talk_ids) > 1:
                # Sort talks by difficulty level
                talks_with_difficulty = []
                for talk_id in talk_ids:
                    talk_data = next(t for t in self.talks if t['talk_id'] == talk_id)
                    talks_with_difficulty.append((talk_id, self.difficulty_levels[talk_data['difficulty']]))
                
                talks_with_difficulty.sort(key=lambda x: x[1])
                
                # Add edges from easier to harder talks in the same topic
                for i in range(len(talks_with_difficulty) - 1):
                    current_talk = talks_with_difficulty[i][0]
                    next_talk = talks_with_difficulty[i + 1][0]
                    
                    # Only add edge if not already connected and won't create cycle
                    if (not self.graph.has_edge(current_talk, next_talk) and 
                        not self._would_create_cycle(current_talk, next_talk)):
                        self.graph.add_edge(current_talk, next_talk, 
                                          relationship='difficulty_progression',
                                          weight=0.5)
    
    def _would_create_cycle(self, source: str, target: str) -> bool:
        """Check if adding an edge would create a cycle"""
        # Temporarily add the edge
        self.graph.add_edge(source, target)
        
        try:
            # Try to find cycles
            has_cycle = not nx.is_directed_acyclic_graph(self.graph)
        except:
            has_cycle = True
        
        # Remove the temporary edge
        self.graph.remove_edge(source, target)
        
        return has_cycle
    
    def _remove_cycles(self):
        """Remove edges that create cycles, prioritizing lower weight edges"""
        while not nx.is_directed_acyclic_graph(self.graph):
            try:
                # Find a cycle
                cycle = nx.find_cycle(self.graph, orientation='original')
                
                # Find the edge with the lowest weight in the cycle
                min_weight = float('inf')
                edge_to_remove = None
                
                for u, v, direction in cycle:
                    if direction == 'forward':
                        weight = self.graph[u][v].get('weight', 1.0)
                        if weight < min_weight:
                            min_weight = weight
                            edge_to_remove = (u, v)
                
                # Remove the edge with minimum weight
                if edge_to_remove:
                    self.graph.remove_edge(edge_to_remove[0], edge_to_remove[1])
                else:
                    # Fallback: remove the first edge in the cycle
                    u, v, _ = cycle[0]
                    self.graph.remove_edge(u, v)
                    
            except nx.NetworkXNoCycle:
                break  # No more cycles
    
    def generate_logical_schedule(self) -> List[Dict]:
        """Generate a topologically sorted schedule of talks"""
        try:
            # Perform topological sort
            schedule_order = list(nx.topological_sort(self.graph))
            
            # Create detailed schedule with reasoning
            schedule = []
            session_counter = 1
            
            for talk_id in schedule_order:
                talk_data = next(t for t in self.talks if t['talk_id'] == talk_id)
                
                # Find prerequisites for this talk
                predecessors = list(self.graph.predecessors(talk_id))
                prerequisite_talks = [p for p in predecessors 
                                    if self.graph[p][talk_id].get('relationship') == 'prerequisite']
                
                # Calculate session timing based on position
                session_info = {
                    'session_order': session_counter,
                    'talk_id': talk_id,
                    'title': talk_data['title'],
                    'difficulty': talk_data['difficulty'],
                    'topic_tags': talk_data['topic_tags'],
                    'abstract': talk_data['abstract'],
                    'prerequisites': prerequisite_talks,
                    'reasoning': self._generate_scheduling_reasoning(talk_id, talk_data, prerequisite_talks)
                }
                
                schedule.append(session_info)
                session_counter += 1
            
            return schedule
            
        except nx.NetworkXError as e:
            print(f"Error in topological sort: {e}")
            # Fallback to difficulty-based sorting
            return self._fallback_schedule()
    
    def _generate_scheduling_reasoning(self, talk_id: str, talk_data: Dict, prerequisites: List[str]) -> str:
        """Generate human-readable reasoning for why a talk is scheduled at this position"""
        reasoning_parts = []
        
        # Difficulty-based reasoning
        if talk_data['difficulty'] == 'Beginner':
            reasoning_parts.append("Foundational content suitable for early placement")
        elif talk_data['difficulty'] == 'Intermediate':
            reasoning_parts.append("Builds on basic concepts, placed after foundational talks")
        else:  # Advanced
            reasoning_parts.append("Advanced content requiring solid background knowledge")
        
        # Prerequisite reasoning
        if prerequisites:
            prereq_titles = []
            for prereq_id in prerequisites:
                prereq_talk = next(t for t in self.talks if t['talk_id'] == prereq_id)
                prereq_titles.append(f"'{prereq_talk['title']}'")
            
            if len(prereq_titles) == 1:
                reasoning_parts.append(f"Requires understanding from {prereq_titles[0]}")
            else:
                reasoning_parts.append(f"Builds on concepts from {', '.join(prereq_titles[:-1])} and {prereq_titles[-1]}")
        
        # Topic clustering reasoning
        main_topics = [tag for tag in talk_data['topic_tags'] 
                      if tag in ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 
                               'Data Engineering', 'MLOps', 'AI Ethics']]
        if main_topics:
            reasoning_parts.append(f"Core {'/'.join(main_topics)} content")
        
        return ". ".join(reasoning_parts) + "."
    
    def _fallback_schedule(self) -> List[Dict]:
        """Fallback scheduling based on difficulty and topic similarity"""
        # Group talks by difficulty
        beginner_talks = [t for t in self.talks if t['difficulty'] == 'Beginner']
        intermediate_talks = [t for t in self.talks if t['difficulty'] == 'Intermediate'] 
        advanced_talks = [t for t in self.talks if t['difficulty'] == 'Advanced']
        
        # Sort within each group by topic relevance
        schedule = []
        session_counter = 1
        
        for difficulty_group in [beginner_talks, intermediate_talks, advanced_talks]:
            for talk in difficulty_group:
                session_info = {
                    'session_order': session_counter,
                    'talk_id': talk['talk_id'],
                    'title': talk['title'],
                    'difficulty': talk['difficulty'],
                    'topic_tags': talk['topic_tags'],
                    'abstract': talk['abstract'],
                    'prerequisites': [],
                    'reasoning': f"Scheduled based on {talk['difficulty']} difficulty level"
                }
                schedule.append(session_info)
                session_counter += 1
        
        return schedule
    
    def generate_schedule_via_graph_traversal(self, start_node: str = None) -> List[str]:
        """Generate schedule by traversing the knowledge graph starting from a specific node"""
        
        # Ensure the graph is acyclic
        if not nx.is_directed_acyclic_graph(self.graph):
            raise ValueError("Graph contains cycles - cannot perform valid traversal")
        
        # Use a modified topological sort that respects a preferred starting point
        schedule_order = []
        visited = set()
        in_degree = {node: self.graph.in_degree(node) for node in self.graph.nodes()}
        
        # Priority queue: (priority, node_id) where lower priority = scheduled first
        from heapq import heappush, heappop
        ready_queue = []
        
        # If start_node specified, give it highest priority
        if start_node and start_node in self.graph.nodes():
            if in_degree[start_node] == 0:
                heappush(ready_queue, (0, start_node))  # Highest priority
        else:
            start_node = self._find_optimal_start_node()
            if in_degree[start_node] == 0:
                heappush(ready_queue, (0, start_node))
        
        # Add all other nodes with no incoming edges
        for node in self.graph.nodes():
            if in_degree[node] == 0 and node != start_node:
                priority = self._calculate_node_priority(node)
                heappush(ready_queue, (priority, node))
        
        while ready_queue:
            # Get the next highest priority node
            _, current_node = heappop(ready_queue)
            
            if current_node in visited:
                continue
                
            # Add to schedule
            schedule_order.append(current_node)
            visited.add(current_node)
            
            # Update in-degrees of successors
            for successor in self.graph.successors(current_node):
                in_degree[successor] -= 1
                
                # If successor has no more prerequisites, add to ready queue
                if in_degree[successor] == 0 and successor not in visited:
                    priority = self._calculate_node_priority(successor)
                    heappush(ready_queue, (priority, successor))
        
        # Verify all nodes were visited
        if len(schedule_order) != len(self.talks):
            missing_nodes = set(self.graph.nodes()) - visited
            raise ValueError(f"Could not schedule all talks. Missing: {missing_nodes}")
        
        return schedule_order
    
    def _calculate_node_priority(self, node: str) -> float:
        """Calculate priority for scheduling (lower = higher priority)"""
        talk_data = next(t for t in self.talks if t['talk_id'] == node)
        
        # Base priority on difficulty (beginner first)
        difficulty_priority = self.difficulty_levels[talk_data['difficulty']]
        
        # Boost priority for foundational topics
        foundational_topics = ['Core Concepts', 'Machine Learning', 'Statistics', 'Data Engineering']
        foundational_boost = 0
        if any(topic in talk_data['topic_tags'] for topic in foundational_topics):
            foundational_boost = -1  # Negative = higher priority
            
        # Boost priority for talks that enable many others
        enablement_boost = -len(list(self.graph.successors(node))) * 0.1
        
        return difficulty_priority + foundational_boost + enablement_boost
    
    def _find_optimal_start_node(self) -> str:
        """Find the best node to start traversal from"""
        # Look for nodes with no incoming edges (sources/roots)
        source_nodes = [node for node in self.graph.nodes() 
                       if self.graph.in_degree(node) == 0]
        
        if source_nodes:
            # Among source nodes, prefer beginner-level talks
            beginner_sources = []
            for node in source_nodes:
                talk_data = next(t for t in self.talks if t['talk_id'] == node)
                if talk_data['difficulty'] == 'Beginner':
                    beginner_sources.append(node)
            
            if beginner_sources:
                # Among beginner sources, prefer foundational topics
                foundational_topics = ['Core Concepts', 'Machine Learning', 'Statistics']
                for node in beginner_sources:
                    talk_data = next(t for t in self.talks if t['talk_id'] == node)
                    if any(topic in talk_data['topic_tags'] for topic in foundational_topics):
                        return node
                
                return beginner_sources[0]  # Return first beginner source
            
            return source_nodes[0]  # Return first source node
        
        # If no source nodes, find node with minimum in-degree
        min_in_degree = min(self.graph.in_degree(node) for node in self.graph.nodes())
        candidates = [node for node in self.graph.nodes() 
                     if self.graph.in_degree(node) == min_in_degree]
        
        return candidates[0]
    
    def _find_optimal_start_node_from_set(self, node_set: Set[str]) -> str:
        """Find the best starting node from a given set of nodes"""
        # Look for nodes with no incoming edges within the set
        source_nodes = [node for node in node_set 
                       if self.graph.in_degree(node) == 0]
        
        if source_nodes:
            return source_nodes[0]
        
        # Find node with minimum in-degree within the set
        min_in_degree = min(self.graph.in_degree(node) for node in node_set)
        candidates = [node for node in node_set 
                     if self.graph.in_degree(node) == min_in_degree]
        
        return candidates[0]
    
    def generate_detailed_schedule_from_traversal(self, start_node: str = None) -> List[Dict]:
        """Generate detailed schedule using graph traversal"""
        schedule_order = self.generate_schedule_via_graph_traversal(start_node)
        
        detailed_schedule = []
        for i, talk_id in enumerate(schedule_order, 1):
            talk_data = next(t for t in self.talks if t['talk_id'] == talk_id)
            
            # Find prerequisites for this talk that appear earlier in schedule
            predecessors = list(self.graph.predecessors(talk_id))
            prerequisite_talks = []
            for pred in predecessors:
                if (self.graph[pred][talk_id].get('relationship') == 'prerequisite' and 
                    pred in schedule_order[:i-1]):  # Only count if scheduled earlier
                    prerequisite_talks.append(pred)
            
            session_info = {
                'session_order': i,
                'talk_id': talk_id,
                'title': talk_data['title'],
                'difficulty': talk_data['difficulty'],
                'topic_tags': talk_data['topic_tags'],
                'abstract': talk_data['abstract'],
                'prerequisites': prerequisite_talks,
                'reasoning': self._generate_traversal_reasoning(talk_id, talk_data, prerequisite_talks, i)
            }
            
            detailed_schedule.append(session_info)
        
        return detailed_schedule
    
    def _generate_traversal_reasoning(self, talk_id: str, talk_data: Dict, 
                                    prerequisites: List[str], position: int) -> str:
        """Generate reasoning for talk placement via graph traversal"""
        reasoning_parts = []
        
        if position <= 5:
            reasoning_parts.append("Early session - foundational content")
        elif position <= len(self.talks) // 2:
            reasoning_parts.append("Mid-conference - builds on foundations")
        else:
            reasoning_parts.append("Later session - advanced/specialized content")
        
        if prerequisites:
            prereq_titles = []
            for prereq_id in prerequisites:
                prereq_talk = next(t for t in self.talks if t['talk_id'] == prereq_id)
                prereq_titles.append(f"'{prereq_talk['title']}'")
            reasoning_parts.append(f"Follows prerequisites: {', '.join(prereq_titles)}")
        
        # Check graph connections
        successors = list(self.graph.successors(talk_id))
        if successors:
            reasoning_parts.append(f"Enables {len(successors)} follow-up topics")
        
        return ". ".join(reasoning_parts) + "."
    
    def export_schedule_json(self, filename: str):
        """Export the generated schedule to a JSON file"""
        schedule = self.generate_logical_schedule()
        
        export_data = {
            'conference_schedule': {
                'total_sessions': len(schedule),
                'scheduling_algorithm': 'Knowledge Graph + Topological Sort',
                'principles': [
                    'Prerequisites must come before dependent topics',
                    'Beginner content before intermediate/advanced',
                    'Related topics grouped together',
                    'Logical progression within topic areas'
                ],
                'sessions': schedule,
                'graph_traversal_sequence': self.generate_schedule_via_graph_traversal(),
                'detailed_traversal': self.generate_detailed_schedule_from_traversal()
            }
        }
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        return export_data
    
    def print_schedule_summary(self):
        """Print a human-readable summary of the schedule"""
        schedule = self.generate_logical_schedule()
        
        print("=== CONFERENCE SCHEDULE KNOWLEDGE GRAPH ===\n")
        print(f"Total Sessions: {len(schedule)}")
        print("Scheduling Principles:")
        print("• Prerequisites before dependent topics")
        print("• Beginner → Intermediate → Advanced progression")
        print("• Related topics clustered together")
        print("• Logical flow within domains\n")
        
        # Group by difficulty for summary
        by_difficulty = defaultdict(list)
        for session in schedule:
            by_difficulty[session['difficulty']].append(session)
        
        for difficulty in ['Beginner', 'Intermediate', 'Advanced']:
            if difficulty in by_difficulty:
                print(f"\n--- {difficulty.upper()} LEVEL ({len(by_difficulty[difficulty])} sessions) ---")
                for session in by_difficulty[difficulty]:
                    print(f"{session['session_order']:2d}. {session['title']}")
                    print(f"    Topics: {', '.join(session['topic_tags'])}")
                    if session['prerequisites']:
                        prereq_titles = []
                        for prereq_id in session['prerequisites']:
                            prereq_talk = next(t for t in self.talks if t['talk_id'] == prereq_id)
                            prereq_titles.append(prereq_talk['title'])
                        print(f"    Prerequisites: {', '.join(prereq_titles)}")
                    print(f"    Reasoning: {session['reasoning']}")
                    print()


def main():
    # Initialize the knowledge graph
    scheduler = TalkSchedulerKnowledgeGraph('example_abstarcts.json')
    
    # Build the knowledge graph
    print("Building knowledge graph...")
    scheduler.build_knowledge_graph()
    
    # Generate and print schedule
    print("Generating logical schedule...\n")
    scheduler.print_schedule_summary()
    
    # Export to JSON
    print("\nExporting schedule to JSON...")
    export_data = scheduler.export_schedule_json('conference_schedule.json')
    print("Schedule exported to 'conference_schedule.json'")
    
    # Generate schedule via graph traversal
    print("\n=== GRAPH TRAVERSAL SCHEDULING ===")
    print("Starting from optimal node and traversing the knowledge graph...")
    
    try:
        # Generate the traversal-based schedule
        traversal_sequence = scheduler.generate_schedule_via_graph_traversal()
        print(f"Successfully traversed all {len(traversal_sequence)} talks")
        print("Talk sequence from graph traversal:", traversal_sequence)
        
        # Show detailed traversal schedule
        print("\n=== DETAILED TRAVERSAL SCHEDULE ===")
        detailed_traversal = scheduler.generate_detailed_schedule_from_traversal()
        for session in detailed_traversal:
            print(f"{session['session_order']:2d}. {session['talk_id']} - {session['title']} ({session['difficulty']})")
            if session['prerequisites']:
                prereq_ids = ", ".join(session['prerequisites'])
                print(f"    Prerequisites: {prereq_ids}")
            print(f"    Reasoning: {session['reasoning']}")
            print()
            
        # Verify no cycles in the final schedule
        print("=== VALIDATION ===")
        print(f"Graph is acyclic: {nx.is_directed_acyclic_graph(scheduler.graph)}")
        print(f"All talks scheduled: {len(traversal_sequence) == len(scheduler.talks)}")
        
        return traversal_sequence
        
    except ValueError as e:
        print(f"Error during graph traversal: {e}")
        print("Falling back to topological sort...")
        return scheduler.generate_logical_schedule()
    
    # Print some statistics
    print(f"\nKnowledge Graph Statistics:")
    print(f"• Total talks: {len(scheduler.talks)}")
    print(f"• Graph nodes: {scheduler.graph.number_of_nodes()}")
    print(f"• Graph edges: {scheduler.graph.number_of_edges()}")
    print(f"• Topic clusters: {len(scheduler.topic_clusters)}")
    
    return export_data

if __name__ == "__main__":
    main()