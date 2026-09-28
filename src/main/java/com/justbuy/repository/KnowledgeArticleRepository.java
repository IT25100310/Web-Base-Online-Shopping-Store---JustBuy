package com.justbuy.repository;

import com.justbuy.model.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, Long> {
    List<KnowledgeArticle> findByPublishedTrueOrderByUpdatedAtDesc();
}
